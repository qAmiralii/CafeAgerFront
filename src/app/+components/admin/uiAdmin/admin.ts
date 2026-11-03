import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { AdminService } from './service/admin.service';
import { ListCategory } from '../../../+shared/listCategory/list-category';
import { BackendService } from '../../../+services/backend-service';
import { Footer } from '../../page/shared/footer/footer';

@Component({
  selector: 'app-admin',
  imports: [RouterLink, Footer],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  adminSer = inject(AdminService);
  protected readonly backend = inject(BackendService);
  private readonly listCategory = inject(ListCategory);
  readonly categories = this.listCategory.categories;
  private readonly router = inject(Router);
  ngOnInit(): void {
    this.backend.photoAddress='maingroup/photo/';
    this.listCategory.list();
  }
  
  isMenuOpen: boolean = false;
  //ایتم منو 
  menuItems = signal([
    { title: 'صفحه اصلی', link: ['/home'] },
    { title: 'دسته بندی ها', link: ['/admin'] },
    { title: 'افزودن دسته بندی', link: ['/admin/addCategory'] },
    { title: 'افزودن غذا و نوشیدنی', link: ['/admin/addfood'] },
    { title: 'افزودن ادمین جدید', link: ['/admin/addnewadmin'] },
    { title: ' تغییر رمز ادمین', link: ['/admin/changePas'] }
  ]);
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  goToProducts(guid: string) {
    if (!guid) return;
    this.router.navigate(['admin/productsAdmin'], { queryParams: { guid } });
  }

  removeCategory(guid: string) {
    if (!guid) return;

    this.adminSer.removeCategory(guid).subscribe({
      next: (response: any) => {
        if (response?.isOk === true) {
          this.listCategory.categories.update(categories =>
            categories.filter(category => category.guid !== guid)
          );
          alert('حذف دسته‌بندی با موفقیت انجام شد');
        } else {
          alert('حذف دسته‌بندی با خطا مواجه شد');
        }
      },
      error: (error: unknown) => {
        console.error('Failed to delete category', error);
        alert('حذف دسته‌بندی با خطا مواجه شد');
      },
    });
  }
}
