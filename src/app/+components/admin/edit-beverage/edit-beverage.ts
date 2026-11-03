import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { BackendService } from '../../../+services/backend-service';
import { ListCategory } from '../../../+shared/listCategory/list-category';

type DrinksTypeEnum = 1 | 2 | 3 | 4;
type CourseTimeEnum = 1 | 2 | 3 | 4; // برای زمان سرو غذا

export interface AdminProduct {
  guid: string | number;
  id: string | number;
  name: string;
  price: number;
  imageUrl: string;
  showInMenu: boolean;
  addOns?: string[];
  groupTitle?: string;
  isBeverage?: boolean;
}

type Category = {
  guid: string;
  categoryTitle: string;
  iconPath?: string;
  isBeverage?: boolean;
};

// اضافه شدن تایپ برای افزودنی‌ها
export interface AddOn {
  id: number | string;
  name: string;
}

@Component({
  selector: 'app-edit-beverage',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit-beverage.html',
  styleUrl: './edit-beverage.css',
})
export class EditBeverage implements OnInit {
  private readonly router = inject(Router);
  private route = inject(ActivatedRoute);
  private backendService = inject(BackendService);
  private readonly listCategory = inject(ListCategory);

  productId: string | null = null;
  selectedFile: File | null = null;

  // --- Signals ---
  activeSection = signal<'food' | 'drink'>('drink');
  readonly isSaving = signal(false);
  imagePreviewUrl = signal<string | null>(null);

  // مدیریت افزودنی‌ها
  isAddOnDropdownOpen = signal(false);
  readonly addOnSearch = signal('');
  selectedAddOns = signal<AddOn[]>([]);
  availableAddOns = signal<AddOn[]>([
   { id: '1', name: 'نعنا' },
  { id: '2', name: 'لیمو' },
  { id: '3', name: 'یخ' },
  { id: '4', name: 'شکر' },
  { id: '5', name: 'سس' },
  { id: '6', name: 'پیاز' },
  { id: '7', name: 'روبوستا 100%' },
  { id: '8', name: 'عربیکا 80/20' },
  { id: '9', name: 'روبوستا 70/30' },
  { id: '10', name: 'روبوستا 60/40' },
  { id: '11', name: 'روبوستا 50/50' },
  { id: '12', name: 'عربیکا 100%' },
  { id: '101', name: 'عربیکا 50/50' },
  { id: '102', name: 'عربیکا' },
  { id: '13', name: 'اسپرسو' },
  { id: '103', name: 'سس شکلات' },
  { id: '104', name: 'بستنی' },
  { id: '14', name: 'شات اضافه' },
  { id: '15', name: 'شیر' },
  { id: '16', name: 'شیر کم‌چرب' },
  { id: '17', name: 'شیر پرچرب' },
  { id: '18', name: 'شیر بادام' },
  { id: '19', name: 'شیر نارگیل' },
  { id: '20', name: 'شیر سویا' },
  { id: '21', name: 'شیر جو' },
  { id: '22', name: 'خامه' },
  { id: '23', name: 'فوم شیر' },
  { id: '24', name: 'شکلات' },
  { id: '25', name: 'شکلات تلخ' },
  { id: '26', name: 'شکلات سفید' },
  { id: '27', name: 'کارامل' },
  { id: '28', name: 'فندق' },
  { id: '29', name: 'بادام' },
  { id: '30', name: 'پسته' },
  { id: '31', name: 'گردو' },
  { id: '32', name: 'نارگیل' },
  { id: '33', name: 'دارچین' },
  { id: '34', name: 'هل' },
  { id: '35', name: 'وانیل' },
  { id: '36', name: 'زعفران' },
  { id: '37', name: 'عسل' },
  { id: '38', name: 'استویا' },
  { id: '39', name: 'شکر قهوه‌ای' },
  { id: '40', name: 'سیروپ وانیل' },
  { id: '41', name: 'سیروپ کارامل' },
  { id: '42', name: 'سیروپ فندق' },
  { id: '43', name: 'سیروپ نارگیل' },
  { id: '44', name: 'سیروپ نعنا' },
  { id: '45', name: 'سیروپ توت' },
  { id: '46', name: 'توت‌فرنگی' },
  { id: '47', name: 'موز' },
  { id: '48', name: 'بلوبری' },
  { id: '49', name: 'تمشک' },
  { id: '50', name: 'آلبالو' },
  { id: '51', name: 'پرتقال' },
  { id: '52', name: 'نارنج' },
  { id: '53', name: 'خیار' },
  { id: '54', name: 'زنجبیل' },
  { id: '55', name: 'مارشمالو' },
  { id: '56', name: 'اورئو' },
  { id: '57', name: 'بیسکویت' },
  { id: '58', name: 'اسمارتیز' },
  { id: '59', name: 'ترافل' },
  { id: '60', name: 'کاکائو' },
  { id: '61', name: 'چیپس شکلات' },
  { id: '62', name: 'پودر نارگیل' },
  { id: '63', name: 'پودر دارچین' },
  { id: '64', name: 'پودر پسته' },
  { id: '65', name: 'پودر فندق' },
  { id: '66', name: 'سس سیر' },
  { id: '67', name: 'سس تند' },
  { id: '68', name: 'سس خردل' },
  { id: '69', name: 'سس باربیکیو' },
  { id: '70', name: 'سس پنیر' },
  { id: '71', name: 'سس قارچ' },
  { id: '72', name: 'سس انار' },
  { id: '73', name: 'سس گوجه' },
  { id: '74', name: 'پنیر اضافه' },
  { id: '75', name: 'قارچ' },
  { id: '76', name: 'ذرت' },
  { id: '77', name: 'زیتون' },
  { id: '78', name: 'خیارشور' },
  { id: '79', name: 'کاهو' },
  { id: '80', name: 'گوجه' },
  { id: '81', name: 'فلفل' },
  { id: '82', name: 'فلفل دلمه' },
  { id: '83', name: 'پیازچه' },
  { id: '84', name: 'جعفری' },
  { id: '85', name: 'ریحان' },
  { id: '86', name: 'آویشن' },
  { id: '87', name: 'کنجد' },
  { id: '88', name: 'نمک' },
  { id: '89', name: 'نمک صورتی' },
  { id: '90', name: 'آب گازدار' },
  { id: '91', name: 'یخ خرد' },
  { id: '92', name: 'یخ قالبی' },
  { id: '93', name: 'آب اضافه' },
  { id: '94', name: 'لیمو سبز' },
  { id: '95', name: 'لیمو خشک' },
  { id: '96', name: 'زعفران' },
  { id: '97', name: 'عسل' },
  { id: '98', name: 'سس شکلات' },
  { id: '99', name: 'سس توت' },
  { id: '100', name: 'سس وانیل' }
]);
  readonly filteredAddOns = computed(() => {
    const query = this.addOnSearch().trim().toLocaleLowerCase();
    return this.availableAddOns().filter(item =>
      item.name.toLocaleLowerCase().includes(query)
    );
  });
  // مدیریت دسته‌بندی‌ها
  isCategoryDropdownOpen = signal(false);
  readonly allCategories = computed(() => this.listCategory.categories());
  selectedCategory = signal<Category>({ guid: '', categoryTitle: 'انتخاب دسته‌بندی...', iconPath: '' });
  private pendingCategoryGuid: string | null = null;
  private pendingCategoryTitle: string | null = null;

  // فیلتر دسته‌بندی بر اساس نوع غذا/نوشیدنی
  filteredCategories = computed(() => {
    return this.allCategories().filter(c =>
      this.activeSection() === 'drink' ? c.isBeverage : !c.isBeverage
    );
  });

  constructor() {
    effect(() => {
      const categories = this.allCategories();
      if (categories.length > 0 && (this.pendingCategoryGuid || this.pendingCategoryTitle)) {
        this.applyPendingCategory();
      }
    });
  }

  // --- ngModel Properties ---
  title: string | null = null;
  price: number = 0;
  isActive: boolean = true;
  productImage: string | null = null;

  previousAddOnA: string | null = null;
  previousAddOnB: string | null = null;
  previousAddOnC: string | null = null;
  hasUserSelectedAddOns = signal(false);

  // --- Enums and Selections ---
  drinksTypeEnum: DrinksTypeEnum = 1;
  courseTimeEnum: CourseTimeEnum = 1;

  drinkTimes = [
    { label: 'سرد', value: 1 as DrinksTypeEnum },
    { label: 'گرم', value: 2 as DrinksTypeEnum }
  ];

  courseTimes = [
    { label: 'پیش غذا', value: 1 as CourseTimeEnum },
    { label: 'غذای اصلی', value: 2 as CourseTimeEnum }
  ];

  ngOnInit(): void {
    // گرفتن آیدی محصول از URL
    this.productId = this.route.snapshot.paramMap.get('guid');

    this.loadCategories();

    if (this.productId) {
      this.loadProductData(this.productId);
    }
  }

  loadCategories(): void {
    this.listCategory.list();
  }

  private normalizeString(value: any): string | null {
    if (value == null) return null;

    const normalized = String(value).trim();
    if (!normalized || normalized.toLowerCase() === 'null' || normalized.toLowerCase() === 'undefined') {
      return null;
    }

    return normalized;
  }

  private applyPendingCategory(): void {
    const categories = this.allCategories();
    if (!categories.length) {
      return;
    }

    if (this.pendingCategoryGuid) {
      const match = categories.find(cat => cat.guid === this.pendingCategoryGuid);
      if (match) {
        this.selectedCategory.set(match);
        this.pendingCategoryGuid = null;
        this.pendingCategoryTitle = null;
        return;
      }
    }

    if (this.pendingCategoryTitle) {
      const match = categories.find(cat => cat.categoryTitle === this.pendingCategoryTitle);
      if (match) {
        this.selectedCategory.set(match);
        this.pendingCategoryGuid = null;
        this.pendingCategoryTitle = null;
      }
    }
  }

  private getApiProduct(response: any): any {
    if (!response || typeof response !== 'object') {
      return null;
    }

    if (Array.isArray(response)) {
      return response[0] ?? null;
    }

    const payload = response?.data ?? response?.result ?? response?.item ?? response?.value ?? response;
    if (Array.isArray(payload)) {
      return payload[0] ?? null;
    }

    return payload;
  }

  private populateProduct(product: any, isBeverage: boolean): void {
    if (!product) {
      return;
    }

    this.activeSection.set(isBeverage ? 'drink' : 'food');
    this.title = this.normalizeString(product.title) ?? this.normalizeString(product.name) ?? null;
    this.price = Number(product.price ?? 1);
    this.isActive = Boolean(product.isActive ?? product.showInMenu ?? true);

    const imageUrl = this.normalizeString(product.productImage) ?? this.normalizeString(product.imageUrl);
    this.productImage = imageUrl;
    this.imagePreviewUrl.set(imageUrl);

    const mainGroupGuid = this.normalizeString(product.mainGroupGuid) ?? this.normalizeString(product.mainGroup?.guid) ?? this.normalizeString(product.parentGroupGuid);
    this.pendingCategoryGuid = mainGroupGuid ?? null;
    this.pendingCategoryTitle = this.normalizeString(product.groupTitle) ?? this.normalizeString(product.categoryTitle) ?? this.normalizeString(product.mainGroupTitle) ?? null;
    this.applyPendingCategory();

    const serializedAddOns = Array.isArray(product.addOns)
      ? product.addOns
        .map((item: unknown) => this.normalizeString(item))
        .filter((addon: string | null): addon is string => typeof addon === 'string' && addon.length > 0)
      : [];

    const previousAddOns = serializedAddOns.length > 0
      ? serializedAddOns
      : [
        this.normalizeString(product.addOnA),
        this.normalizeString(product.addOnB),
        this.normalizeString(product.addOnC)
      ].filter((addon): addon is string => Boolean(addon));

    this.previousAddOnA = previousAddOns[0] ?? null;
    this.previousAddOnB = previousAddOns[1] ?? null;
    this.previousAddOnC = previousAddOns[2] ?? null;

    this.selectedAddOns.set([]);
    this.hasUserSelectedAddOns.set(false);

    this.drinksTypeEnum = Number(product.drinksTypeEnum ?? product.typeEnum ?? 1) as DrinksTypeEnum;
    this.courseTimeEnum = Number(product.courseTimeEnum ?? product.typeEnum ?? 1) as CourseTimeEnum;
  }

  loadProductData(id: string): void {
    const passedProduct = history.state?.product;
    if (passedProduct && (passedProduct.guid === id || passedProduct.id === id)) {
      const product = this.getApiProduct(passedProduct);
      this.populateProduct(product, passedProduct.isBeverage ?? this.activeSection() === 'drink');
      return;
    }

    this.backendService.getCatOrPr(`beverageadmin/get/${id}`).subscribe({
      next: (res: any) => {
        const product = this.getApiProduct(res);
        if (product) {
          this.populateProduct(product, true);
        } else {
          this.loadFoodProductData(id);
        }
      },
      error: () => this.loadFoodProductData(id),
    });
  }

  private loadFoodProductData(id: string): void {
    this.backendService.getCatOrPr(`maincourceadmin/get/${id}`).subscribe({
      next: (res: any) => {
        const product = this.getApiProduct(res);
        if (product) {
          this.populateProduct(product, false);
        } else {
          console.warn('No product payload returned for main course id', id);
        }
      },
      error: (err: any) => console.error('Unable to load product data for', id, err),
    });
  }

  // --- Methods ---

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.imagePreviewUrl.set(e.target.result);
      reader.readAsDataURL(file);
    }
  }

  toggleDropdown(): void {
    this.isAddOnDropdownOpen.update(v => !v);
  }

  toggleAddOn(item: AddOn): void {
    this.hasUserSelectedAddOns.set(true);
    const current = this.selectedAddOns();
    const index = current.findIndex(a => a.id === item.id);

    if (index > -1) {
      // حذف آیتم
      this.selectedAddOns.set(current.filter(a => a.id !== item.id));
    } else if (current.length < 3) {
      // افزودن آیتم (حداکثر 3 تا)
      this.selectedAddOns.set([...current, item]);
    }
  }

  isAddonSelected(item: AddOn): boolean {
    return this.selectedAddOns().some(addon => addon.id === item.id);
  }

  toggleCategoryDropdown(): void {
    this.isCategoryDropdownOpen.update(v => !v);
  }

  selectCategory(cat: Category): void {
    this.selectedCategory.set(cat);
    this.isCategoryDropdownOpen.set(false);
  }

  setDrinkTime(value: DrinksTypeEnum): void {
    this.drinksTypeEnum = value;
  }

  setCourseTime(value: CourseTimeEnum): void {
    this.courseTimeEnum = value;
  }

  updateProduct(): void {
    if (!this.productId || this.isSaving()) return;

    const isBeverage = this.activeSection() === 'drink';
    const endpoint = isBeverage
      ? `beverageadmin/update/${this.productId}`
      : `maincourceadmin/update/${this.productId}`;

    const selected = this.selectedAddOns();
    const useSelectedAddOns = this.hasUserSelectedAddOns() && selected.length === 3;
    const addOnValues = useSelectedAddOns
      ? [selected[0]?.name ?? null, selected[1]?.name ?? null, selected[2]?.name ?? null]
      : [this.previousAddOnA, this.previousAddOnB, this.previousAddOnC];

    const payload: Record<string, unknown> = {
      title: this.title?.trim() || null,
      addOnA: addOnValues[0] ?? null,
      addOnB: addOnValues[1] ?? null,
      addOnC: addOnValues[2] ?? null,
      price: this.price,
      isActive: this.isActive,
      productImage: this.productImage ?? null,
      isVirtualRemoved: true,
      mainGroupGuid: this.selectedCategory().guid || null,
    };

    if (isBeverage) {
      payload['drinksTypeEnum'] = this.drinksTypeEnum;
    } else {
      payload['courseTimeEnum'] = this.courseTimeEnum;
    }


    this.isSaving.set(true);
    this.backendService.post(endpoint, payload).pipe(
      finalize(() => this.isSaving.set(false))
    ).subscribe({
      next: (res: any) => {
        alert('محصول با موفقیت بروزرسانی شد');
        this.router.navigate(['/admin']);
      },
      error: (err: any) => {
        alert('بروزرسانی محصول با خطا مواجه شد');
      }
    });
  }
}
