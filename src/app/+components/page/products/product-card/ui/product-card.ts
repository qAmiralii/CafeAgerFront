import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BackendService } from '../../../../../+services/backend-service';

export interface ProductBadge {
  type: 'arabica' | 'robusta' | 'ratio' | string;
  value: string;
  label?: string;
}

export interface CaffeeProduct {
  id: string | number;
  guid: string | number;
  title: string;
  imageUrl: string;
  price: number;
  badges: ProductBadge[];
}

@Component({
  imports: [],
  selector: 'app-product-card',
  styleUrl: './product-card.css',
  templateUrl: './product-card.html',
})
export class ProductCard implements OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isBeverage']) {
      this.backend.photoAddress = this.isBeverage ? 'beverages/photo/' : 'maincourse/photo/';
    }
  }

  backend = inject(BackendService);
  //! یعنی این مقدار توسط انگولار تنظیم خواهد شد
  @Input() product!: CaffeeProduct;
  @Input() isBeverage!: boolean;


}
