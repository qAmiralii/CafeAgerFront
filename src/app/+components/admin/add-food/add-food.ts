import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { BackendService } from '../../../+services/backend-service';
import { ListCategory } from '../../../+shared/listCategory/list-category';

type MainGroup = {
  guid: string;
  categoryTitle: string;
  iconPath?: string;
  isBeverage: boolean;
};

type AddFoodPayload = {
  title: string | null;
  price: number;
  addOnA: string | null;
  addOnB: string | null;
  addOnC: string | null;
  isActive: boolean;
  mainGroupGuid: string | null;
  file: File | null;
  courseTimeEnum?: number;
  drinksTypeEnum?: number;
};

export interface AddOnItem {
  id: string;
  name: string;
}

@Component({
  selector: 'app-add-food',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './add-food.html',
  styleUrl: './add-food.css',
})
export class AddFood implements OnInit {
  private readonly listCategory = inject(ListCategory);
  private readonly backend = inject(BackendService);
  private readonly router = inject(Router);

  readonly categories = this.listCategory.categories as Signal<MainGroup[]>;
  activeSection = signal<'food' | 'drink'>('food');

  readonly titleSignal = signal<string | null>(null);
  readonly priceSignal = signal<number>(1);
  readonly isActiveSignal = signal<boolean>(true);
  readonly courseTimeEnumSignal = signal<number>(1);
  readonly drinksTypeEnumSignal = signal<number>(1);
  readonly mainGroupGuidSignal = signal<string | null>(null);
  readonly productImageSignal = signal<File | null>(null);

  // سیگنال جدید برای مدیریت نمایش ارورها
  readonly showErrors = signal<boolean>(false);
  readonly isSaving = signal(false);

  get title() {
    return this.titleSignal();
  }
  set title(value: string | null) {
    this.titleSignal.set(value);
  }

  get price() {
    return this.priceSignal();
  }
  set price(value: number) {
    this.priceSignal.set(value);
  }

  get isActive() {
    return this.isActiveSignal();
  }
  set isActive(value: boolean) {
    this.isActiveSignal.set(value);
  }

  get courseTimeEnum() {
    return this.courseTimeEnumSignal();
  }
  set courseTimeEnum(value: number) {
    this.courseTimeEnumSignal.set(value);
  }

  get drinksTypeEnum() {
    return this.drinksTypeEnumSignal();
  }
  set drinksTypeEnum(value: number) {
    this.drinksTypeEnumSignal.set(value);
  }

  get mainGroupGuid() {
    return this.mainGroupGuidSignal();
  }
  set mainGroupGuid(value: string | null) {
    this.mainGroupGuidSignal.set(value);
  }

  get productImage() {
    return this.productImageSignal();
  }
  set productImage(value: File | null) {
    this.productImageSignal.set(value);
  }

  readonly isCategoryDropdownOpen = signal(false);
  readonly imagePreviewUrl = signal<string | null>(null);
  readonly selectedFile = signal<File | null>(null);

  private readonly imagePreviewDataUrl = signal<string | null>(null);

  readonly courseTimes = [
    { value: 0, label: 'صبحانه' },
    { value: 1, label: 'وعده اصلی' },
    { value: 3, label: 'عصرانه' },
    { value: 4, label: 'هیچکدام' },
  ];
  readonly drinkTimes = [
    { value: 0, label: 'سرد' },
    { value: 1, label: 'گرم' },
  ];

  readonly isAddOnDropdownOpen = signal(false);
  readonly addOnSearch = signal('');
readonly availableAddOns = signal<AddOnItem[]>([
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
  readonly selectedAddOns = signal<AddOnItem[]>([]);
  // ---------------------------------------------

  ngOnInit(): void {
    this.listCategory.list();
    this.setSection('food');
  }

  setSection(section: 'food' | 'drink') {
    this.activeSection.set(section);
    this.title = null;
    this.price = 1;
    this.isActive = true;
    this.mainGroupGuid = null;
    this.productImage = null;
    this.imagePreviewUrl.set(null);
    this.selectedFile.set(null);
    this.imagePreviewDataUrl.set(null);
    this.selectedAddOns.set([]);
    
    // هنگام تغییر تب، وضعیت ارورها را ریست می‌کنیم
    this.showErrors.set(false);

    if (section === 'drink') {
      this.drinksTypeEnum = 1;
      this.courseTimeEnum = 1;
    } else {
      this.courseTimeEnum = 1;
      this.drinksTypeEnum = 1;
    }
  }

  readonly filteredCategories = computed(() => {
    return this.categories().filter(cat =>
      this.activeSection() === 'drink' ? cat.isBeverage : !cat.isBeverage
    );
  });

  selectedCategory = computed(() => {
    const current = this.mainGroupGuid;
    const categories = this.categories();

    return categories.find(x => x.guid === current) ?? {
      guid: '',
      categoryTitle: 'دسته‌بندی را انتخاب کنید',
      iconPath: '',
      isBeverage: false,
    };
  });

  toggleCategoryDropdown() {
    this.isCategoryDropdownOpen.update(v => !v);
  }

  selectCategory(category: MainGroup) {
    this.mainGroupGuid = category.guid;
    this.isCategoryDropdownOpen.set(false);
  }

  setCourseTime(value: number) {
    this.courseTimeEnum = value;
  }
  setDrinkTime(value: number) {
    this.drinksTypeEnum = value;
  }

  toggleDropdown() {
    this.isAddOnDropdownOpen.update(val => !val);
  }

  isSelected(addon: AddOnItem): boolean {
    return this.selectedAddOns().some(a => a.id === addon.id);
  }

  toggleAddOn(addon: AddOnItem) {
    const current = this.selectedAddOns();
    const exists = current.find(a => a.id === addon.id);

    if (exists) {
      this.selectedAddOns.set(current.filter(a => a.id !== addon.id));
    } else {
      if (current.length < 3) {
        this.selectedAddOns.set([...current, addon]);
      }
    }

    this.updatePayloadAddOns();
  }

  updatePayloadAddOns() {
    return;
  }

  getSelectedAddOnNames(): string {
    return this.selectedAddOns().map(a => a.name).join('، ');
  }

  addNewAddOn(name: string) {
    if (!name.trim()) return;

    const newItem: AddOnItem = {
      id: Date.now().toString(),
      name: name.trim()
    };

    this.availableAddOns.update(list => [...list, newItem]);
  }
  // -----------------------------

  saveFood() {
    if (this.isSaving()) return;

    // 1. نمایش ارورها را فعال می‌کنیم تا UI به‌روز شود
    this.showErrors.set(true);

    const selectedCategory = this.selectedCategory();
    
    // 2. بررسی خالی بودن فیلدهای اجباری
    const hasTitle = !!this.title?.trim();
    const hasCategory = !!selectedCategory.guid;
    const hasPrice = this.price > 0;
    const hasImage = !!this.productImage;

    // اگر هرکدام از اینها خالی بود عملیات متوقف می‌شود
    if (!hasTitle || !hasCategory || !hasPrice || !hasImage) {
      // اسکرول نرم به بالا برای دیدن پیام ارور
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // ادامه عملیات در صورت موفق بودن اعتبارسنجی
    const endpoint =
      this.activeSection() === 'drink' || selectedCategory.isBeverage
        ? 'beverageadmin/add'
        : 'maincourceadmin/add';

    const selectedAddOns = this.selectedAddOns();
    const formData = new FormData();

    formData.append('title', this.title?.trim() ?? '');
    formData.append('price', this.price.toString());

    formData.append('addOnA', selectedAddOns[0]?.name ?? '');
    formData.append('addOnB', selectedAddOns[1]?.name ?? '');
    formData.append('addOnC', selectedAddOns[2]?.name ?? '');

    formData.append('isActive', this.isActive.toString());
    formData.append('mainGroupGuid', this.mainGroupGuid ?? '');

    if (this.activeSection() === 'food') {
      formData.append('courseTimeEnum', this.courseTimeEnum.toString());
    } else {
      formData.append('drinksTypeEnum', this.drinksTypeEnum.toString());
    }

    if (this.productImage) {
      formData.append('file', this.productImage, this.productImage.name);
    }

    this.isSaving.set(true);
    this.backend.post(endpoint, formData).pipe(
      finalize(() => this.isSaving.set(false))
    ).subscribe({
      next: () => {
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        console.error('Failed to save product:', err);
      },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) return;

    this.selectedFile.set(file);
    this.productImage = file;

    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result as string;
      this.imagePreviewDataUrl.set(imageData);
      this.imagePreviewUrl.set(imageData);
    };
    reader.readAsDataURL(file);
  }
}
