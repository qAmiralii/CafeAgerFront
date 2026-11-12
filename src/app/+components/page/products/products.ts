import { Component, inject, signal } from '@angular/core';
import { ListCategory } from '../../../+shared/listCategory/list-category';
import { firstValueFrom, of } from 'rxjs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductCard } from './product-card/ui/product-card';
import { Footer } from '../shared/footer/footer';
import { BackendService } from '../../../+services/backend-service';

// اینترفیس دسته بندی
interface menuProduct {
  id: string;
  guid: string;
  title: string;
  imageUrl: string;
  price: number;
  badges: Array<{ type: string; value: string; lable?: string }>;
}

@Component({
  imports: [RouterLink, ProductCard, Footer],
  selector: 'app-products',
  styleUrl: './products.css',
  templateUrl: './products.html',
})
export class Products {
newSelected(guid: string, isBeverage: boolean): void {
  this.selectedGuid.set(guid);
  void this.loadProduct(guid, isBeverage);
}

  private readonly categoryService = inject(ListCategory);
  private readonly route = inject(ActivatedRoute);
  private readonly backend = inject(BackendService);

  readonly products = signal<menuProduct[]>([]);
  readonly categories = this.categoryService.categories;
  readonly selectedCategotyTitle = signal('');

  private productLoadRequest = 0;
  protected isBeverage = signal<boolean>(false);
  //پیدا کردن نوع دسته بندی انتخاب شده
  protected selectedGuid = signal<string | null>(null);
  // protected selectedBeverage = signal<boolean>(false);


  ngOnInit(): void {
    //گرفتن جی یو ای دی از روت
    const guid = this.route.snapshot.queryParamMap.get('guid');
    const type = this.route.snapshot.queryParamMap.get('type');

    //ست کردن دسته بندی انتخاب شده
    this.selectedGuid.set(guid);
    this.categoryService.list();
    if (guid) {
      const isBeverage = type === 'beverage';
      void this.loadProduct(guid, this.isBeverage())
    }
  }

  //پرومایس جواب آینده تابع رو مشخص میکند و این تابع جواب مشخصی ندارد؟؟؟
  private async loadProduct(guid: string, isBeverage: boolean): Promise<void> {
    // backend endpoint
    const endpoind = isBeverage ? `publicbeverages/list/${guid}` : `publicmaincourse/list/${guid}`;
    const requestId = ++this.productLoadRequest;
    //نوشیدنی
    this.isBeverage.set(isBeverage);
    this.products.set([]); //پاک کردن محصولات قبل
    //fake loading

    try {
      //ارسال درخاست به بک اند
      const response = await firstValueFrom(this.backend.post(endpoind, {}));

      if (requestId !== this.productLoadRequest) {
        return;
      }
      //برسی میکند جواب سرور نال نباشه و حتما شی باشد
      const record = (response && typeof response === 'object')
        //اگر شرط بر قرار بود پاسخ را یک شی با کلید متنی و مقادیر نا مشخص در نظر بگیر
        ? response as Record<string, unknown> : {};

      // در این مرحله برسی میشود که ایا در ریسپانس ارایه ای وجود دارد یا خیر
      const payload = Array.isArray(response) ? response
        : Array.isArray(record['data'])
          ? record['data'] as unknown[]
          : Array.isArray(record['result'])
            ? record['result'] as unknown[]
            : [];
      //دریافت ارایه خام

      //یک سال سازی ارایه دریافت شده
      const normalise = (Array.isArray(payload) ? payload : [])
        .map((item: any, index: number) => ({
          id: item?.guid ?? item?.id ?? `${guid}-${index}`,
          guid: item?.guid ?? item?.id ?? `${guid}-${index}`,
          title: item?.title ?? item?.name ?? item?.productTitle ?? 'محصول',
          imageUrl: item?.productImage ?? item?.imagePath ?? item?.imageUrl ?? item?.image ?? '',
          price: Number(item?.price ?? item?.cost ?? item?.productPrice ?? 0),
          //ساخت برچسب های محصول
          badges: [
            item?.addOnA ? { type: 'arabica', value: item.addOnA, label: '' } : null,
            item?.addOnB ? { type: 'robusta', value: item.addOnB, label: '' } : null,
            item?.addOnC ? { type: 'ratio', value: item.addOnC, label: '' } : null,
          ]
            //حذف برچسب های خالی
            // اعلام نوع برچسب
            .filter(Boolean) as Array<{ type: string, value: string; label?: string }>
        }));

      this.products.set(normalise);
      const selectedCategory = this.categories().find((item: any) => item.guid === guid);
      //میگم که از روی کتگوری پیدا شده عنوان دسته بندی رو پیدا کن و اگه چیزی نداشت بنویس محصول
      this.selectedCategotyTitle.set(selectedCategory?.categoryTitle ?? 'محصول')

    }
    catch(error) {
      console.error('Failed to load public products', error);
      //copy
      if (requestId === this.productLoadRequest) {
        this.products.set([]);
      }
    } 

  }





}
