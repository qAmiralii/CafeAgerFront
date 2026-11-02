import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ListCategory } from '../../../../+shared/listCategory/list-category';
import { BackendService } from '../../../../+services/backend-service';
import { Footer } from '../../shared/footer/footer';

// اینترفیس دسته بندی
interface Category {
  guid: string;
  Title: string;
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
  retryCategoryLoad() {
    this.listCategory.list();
  }
  ngOnInit(): void {
    this.listCategory.list();
    this.Backnd.photoAddress = 'maingroup/photo/';
  }

  // سیگنال اصلی برای گرفتن دسته بندی ها
  private readonly listCategory = inject(ListCategory);
  // router جای routerLink

  private readonly Backnd = inject(BackendService);
  //صدا کردن تابع لود
  readonly loadMenu = this.listCategory.isLoading;
  //ارایه ای از دسته بندی ها
  readonly MenuTtems = this.listCategory.categories;
  //لود نشدن دسته بندی ها









}
