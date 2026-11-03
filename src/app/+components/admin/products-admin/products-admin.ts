import { Component, inject, signal, effect, untracked } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AdminProduct, ProductCardAdmin } from '../product-card-admin/product-card-admin';
import { ListCategory } from '../../../+shared/listCategory/list-category';
import { BackendService } from '../../../+services/backend-service';
import { firstValueFrom } from 'rxjs';

// --- Pure Functions for Data Mapping (خارج از کلاس برای تمیزی و تست‌پذیری بهتر) ---
const normalizeString = (value: any): string | undefined => {
  if (value == null) return undefined;
  const normalized = String(value).trim();
  if (!normalized || normalized.toLowerCase() === 'null' || normalized.toLowerCase() === 'undefined') {
    return undefined;
  }
  return normalized;
};

const normalizeAddOns = (rawAddOns: any): string[] => {
  const addOnItems = Array.isArray(rawAddOns) ? rawAddOns : [rawAddOns];
  return addOnItems.map(normalizeString).filter((value): value is string => Boolean(value));
};

const normalizeBoolean = (value: unknown, fallback: boolean): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.trim().toLowerCase() === 'false' || value.trim() === '0') return false;
    if (value.trim().toLowerCase() === 'true' || value.trim() === '1') return true;
  }
  if (typeof value === 'number') return value !== 0;
  return fallback;
};

const mapToAdminProduct = (item: any): AdminProduct => {
  const rawAddOns = item?.addOns ?? [item?.addOnA, item?.addOnB, item?.addOnC];
  const guid = item?.guid ?? item?.productId ?? item?.id ?? '';
  const id = item?.id ?? item?.guid ?? item?.productId ?? '';
  return {
    guid,
    id,
    name: normalizeString(item?.title) ?? normalizeString(item?.name) ?? normalizeString(item?.productTitle) ?? normalizeString(item?.productName) ?? 'بدون نام',
    price: Number(item?.price ?? item?.cost ?? item?.productPrice ?? 0),
    imageUrl: normalizeString(item?.productImage) ?? normalizeString(item?.imagePath) ?? normalizeString(item?.imageUrl) ?? normalizeString(item?.image) ?? normalizeString(item?.thumbnail) ?? '',
    showInMenu: normalizeBoolean(item?.isActive ?? item?.showInMenu ?? item?.isInMenu, true),
    addOns: normalizeAddOns(rawAddOns),
    groupTitle: normalizeString(item?.mainGroupTitle) ?? normalizeString(item?.mainGroup) ?? normalizeString(item?.categoryTitle) ?? normalizeString(item?.groupTitle) ?? normalizeString(item?.sectionTitle) ?? '',
    isBeverage: item?.isBeverage === true,
    mainGroupGuid: item?.mainGroupGuid ?? item?.mainGroup?.guid ?? item?.parentGroupGuid,
    updateData: item,
  };
};

const extractPayloadArray = (response: unknown): any[] => {
  if (Array.isArray(response)) {
    return response;
  }

  if (!response || typeof response !== 'object') {
    return [];
  }

  const record = response as Record<string, unknown>;
  const payload = record['data'] ?? record['result'] ?? record['items'] ?? record['value'];

  return Array.isArray(payload) ? payload : [];
};

@Component({
  selector: 'app-products-admin',
  imports: [ProductCardAdmin , RouterLink],
  templateUrl: './products-admin.html',
  styleUrl: './products-admin.css',
})
export class ProductsAdmin {
  protected products = signal<AdminProduct[]>([]);
  protected selectedCategoryGuid = signal<string | null>(null);
  protected isBeverage = signal<boolean>(false);
  protected selectedCategoryTitle = signal<string>('محصولات');

  protected readonly listCategory = inject(ListCategory);
  protected readonly backend = inject(BackendService);
  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);

  protected readonly categories = this.listCategory.categories;

  constructor() {
    // خواندن guid از URL هنگام مقداردهی اولیه
    const initialGuid = this.route.snapshot.queryParamMap.get('guid') ?? this.route.snapshot.paramMap.get('guid');
    if (initialGuid) {
      this.selectedCategoryGuid.set(initialGuid);
    }

    // Effect: جایگزین حلقه while و setTimeout. 
    // هر زمان categories یا selectedCategoryGuid تغییر کنند و معتبر باشند، متد را صدا می‌زند.
    effect(() => {
      const cats = this.categories();
      const guid = this.selectedCategoryGuid();

      if (cats && cats.length > 0 && guid) {
        // Untracked باعث می‌شود تغییرات داخل selectCategory باعث اجرای مجدد و لوپ بی‌نهایت effect نشود
        untracked(() => {
          void this.selectCategory(guid, cats);
        });
      }
    });
  }

  ngOnInit(): void {
    this.listCategory.list();

    // در صورتی که نیاز داری تغییرات URL در طول حضور در این صفحه هم رصد شود:
    this.route.queryParams.subscribe(params => {
      if (params['guid'] && params['guid'] !== this.selectedCategoryGuid()) {
        this.selectedCategoryGuid.set(params['guid']);
      }
    });
  }

  protected async selectCategory(guid: string, categoriesList: any[]) {
    const cat = categoriesList.find((c: any) => c.guid === guid);
    this.selectedCategoryTitle.set(cat?.categoryTitle ?? 'محصولات');
    this.products.set([]); // پاک کردن محصولات قبلی

    const endpoints: Array<{ url: string; isBeverage: boolean }> = [];
    if (cat?.isBeverage === true) {
      endpoints.push({ url: `beverageadmin/list/${guid}`, isBeverage: true });
      this.isBeverage.set(true);
    } else if (cat?.isBeverage === false) {
      endpoints.push({ url: `maincourceadmin/list/${guid}`, isBeverage: false });
      this.isBeverage.set(false);
    } else {
      endpoints.push({ url: `beverageadmin/list/${guid}`, isBeverage: true }, { url: `maincourceadmin/list/${guid}`, isBeverage: false });
      this.isBeverage.set(false);
    }

    try {
      // استفاده از Promise.all برای اجرای موازی ریکوئست‌ها (افزایش چشمگیر سرعت)
      const responses = await Promise.all(
        endpoints.map(ep =>
          firstValueFrom(this.backend.post(ep.url, {})).then(res => ({ res, isBeverage: ep.isBeverage })).catch(err => {
            console.error(`[ProductsAdmin] Failed loading ${ep.url}`, err);
            return null; // هندل کردن خطای یک ریکوئست بدون متوقف کردن بقیه
          })
        )
      );

      const results: any[] = [];
      responses.forEach((response) => {
        if (!response) return;

        const payload = extractPayloadArray(response.res);
        const augmented = payload.map(item => ({
          ...item,
          isBeverage: response.isBeverage,
          mainGroupGuid: item?.mainGroupGuid ?? item?.mainGroup?.guid ?? item?.parentGroupGuid ?? guid,
        }));
        if (augmented.length > 0) {
          results.push(...augmented);
        }
      });

      // نرمال‌سازی و مپ کردن داده‌ها با استفاده از تابع خالص
      const mapped = results.map(mapToAdminProduct);
      this.products.set(mapped);

      // آپدیت URL (بدون تریگر کردن مجدد روت)
      void this.router.navigate([], { relativeTo: this.route, queryParams: { guid }, replaceUrl: true });

    } catch (error) {
      console.error('[ProductsAdmin] Error processing categories:', error);
    }
  }

  protected goToAddProduct(): void {
    void this.router.navigate(['/admin/addfood']);
  }

  onProductDeleted(guid: string | number): void {
    this.products.update(products =>
      products.filter(product => product.guid !== guid)
    );
  }

  onProductVisibilityChange(event: { product: AdminProduct; showInMenu: boolean }): void {
    this.products.update(products =>
      products.map(product =>
        product.guid === event.product.guid
          ? { ...product, showInMenu: event.showInMenu }
          : product
      )
    );
  }

  protected goBack(): void {
    // void this.router.navigate(['/admin']);
  }
}
