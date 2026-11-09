import { Component, Input } from '@angular/core';

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
export class ProductCard {
  //! یعنی این مقدار توسط انگولار تنظیم خواهد شد
  @Input() product!: CaffeeProduct; 
}
