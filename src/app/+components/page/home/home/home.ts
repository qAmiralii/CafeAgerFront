import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ListCategory } from '../../../../+shared/listCategory/list-category';
import { BackendService } from '../../../../+services/backend-service';
import { Footer } from '../../shared/footer/footer';
import { delay, map, of, timer } from 'rxjs';

// اینترفیس دسته بندی
interface Category {
  guid: string;
  categoryTitle: string;
  isBeverage: boolean;
  iconPath: string;
}

@Component({
  imports: [RouterLink, Footer],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  // ۱. مقدار اولیه true
  loading = signal<boolean>(true);



  retryCategoryLoad() {
    this.listCategory.list();
  }
  ngOnInit(): void {
    this.listCategory.list();
    this.Backnd.photoAddress = 'maingroup/photo/';

    //دیلی الکی
    setTimeout(()=>{
      this.loading.set(false)
    },2000)
  }

  // سیگنال اصلی برای گرفتن دسته بندی ها
  private readonly listCategory = inject(ListCategory);
  // router جای routerLink

  private readonly Backnd = inject(BackendService);
  //صدا کردن تابع لود
  // readonly loadMenu = this.listCategory.isLoading;
  //ارایه ای از دسته بندی ها
  readonly MenuTtems = this.listCategory.categories;
  //لود نشدن دسته بندی ها









}
