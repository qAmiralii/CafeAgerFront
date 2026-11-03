import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { CardAdminService } from './services/card-admin.service';
import { Router } from '@angular/router';
import { BackendService } from '../../../+services/backend-service';
import { finalize } from 'rxjs';

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
  mainGroupGuid?: string;
  updateData?: Record<string, any>;
}

@Component({
  selector: 'app-product-card-admin',
  imports: [DecimalPipe],
  templateUrl: './product-card-admin.html',
  styleUrl: './product-card-admin.css',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class ProductCardAdmin implements OnInit {
  ngOnInit(): void {
    if (this.isBeverage==true) {
      this.backend.photoAddress='beverages/photo/';
    } else {
      this.backend.photoAddress='maincourse/photo/';

    }
  }
  cardSer = inject(CardAdminService);
  protected readonly backend = inject(BackendService);
  private router = inject(Router);
  @Input({ required: true }) product!: AdminProduct;
  @Input() isBeverage!: boolean;
  @Output() readonly edit = new EventEmitter<AdminProduct>();
  @Output() readonly deleted = new EventEmitter<string | number>();
  @Output() readonly visibilityChange = new EventEmitter<{
    product: AdminProduct;
    showInMenu: boolean;
  }>();
  protected readonly isVisibilityUpdating = signal(false);


  protected onEdit(product: AdminProduct): void {
    void this.router.navigate(['/admin/edit-beverage', product.guid], { state: { product } });
  }

  onDelete(guid: string | number, isBeverage: boolean | undefined) {
    if (isBeverage == true) {
      this.cardSer.guid = guid;
      this.cardSer.removeBeverage({} as any).subscribe({
        next: (response: any) => {
          if (response.isOk == true) {
            alert('حذف نوشیدنی با موفقیت انجام شد');
            this.deleted.emit(guid);
          } else {
            alert('حذف نوشیدنی با خطا مواجه شد');
          }
        },
        error: (error: any) => {
          alert('حذف نوشیدنی با خطا مواجه شد');
        }
      });
    } else if (isBeverage == false) {
      this.cardSer.guid = guid;
      this.cardSer.removeFood({} as any).subscribe({
        next: (response: any) => {
          if (response.isOk == true) {
            alert('حذف غذا با موفقیت انجام شد');
            this.deleted.emit(guid);
          } else {
            alert('حذف غذا با خطا مواجه شد');
          }
        },
        error: (error: any) => {
          alert('حذف غذا با خطا مواجه شد');
        }
      });
    }
  }


  protected onVisibilityChange(showInMenu: boolean): void {
    this.visibilityChange.emit({
      product: this.product,
      showInMenu,
    });
  }

  protected toggleVisibility(): void {
    if (this.isVisibilityUpdating()) return;

    const isBeverage = this.product.isBeverage ?? this.isBeverage;
    const productPath = isBeverage ? 'beverageadmin' : 'maincourceadmin';
    const previousShowInMenu = this.product.showInMenu;
    const showInMenu = !this.product.showInMenu;
    const product = this.product.updateData ?? {};
    const addOns = Array.isArray(product['addOns']) ? product['addOns'] : [];
    const payload: Record<string, unknown> = {
      title: product['title'] ?? product['name'] ?? this.product.name,
      addOnA: product['addOnA'] ?? addOns[0] ?? null,
      addOnB: product['addOnB'] ?? addOns[1] ?? null,
      addOnC: product['addOnC'] ?? addOns[2] ?? null,
      price: product['price'] ?? this.product.price,
      isActive: showInMenu,
      productImage: product['productImage'] ?? product['imageUrl'] ?? this.product.imageUrl ?? null,
      isVirtualRemoved: true,
      mainGroupGuid: product['mainGroupGuid'] ?? product['mainGroup']?.guid
        ?? product['parentGroupGuid'] ?? this.product.mainGroupGuid ?? null,
    };

    if (isBeverage) {
      payload['drinksTypeEnum'] = product['drinksTypeEnum'] ?? product['typeEnum'] ?? 1;
    } else {
      payload['courseTimeEnum'] = product['courseTimeEnum'] ?? product['typeEnum'] ?? 1;
    }

    this.isVisibilityUpdating.set(true);
    this.onVisibilityChange(showInMenu);
    this.backend.post(`${productPath}/update/${this.product.guid}`, payload).pipe(
      finalize(() => this.isVisibilityUpdating.set(false))
    ).subscribe({
      next: (response: any) => {
        if (response?.isOk === false) {
          this.onVisibilityChange(previousShowInMenu);
          alert('بروزرسانی وضعیت نمایش محصول در منو با خطا مواجه شد');
        }
      },
      error: (error: unknown) => {
        console.error('Unable to update product menu visibility:', error);
        this.onVisibilityChange(previousShowInMenu);
        alert('بروزرسانی وضعیت نمایش محصول در منو با خطا مواجه شد');
      },
    });
  }

}
