import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { expect, vi } from 'vitest';
import { BackendService } from '../../../+services/backend-service';

import { ProductCardAdmin } from './product-card-admin';

describe('ProductCardAdmin', () => {
  let component: ProductCardAdmin;
  let fixture: ComponentFixture<ProductCardAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCardAdmin],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCardAdmin);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('product', {
      guid: 'product-1',
      id: 'product-1',
      name: 'محصول آزمایشی',
      price: 100,
      imageUrl: '',
      showInMenu: true,
      isBeverage: true,
    });
    fixture.componentRef.setInput('isBeverage', true);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updates menu visibility through the product update endpoint', () => {
    const backend = TestBed.inject(BackendService);
    const post = vi.spyOn(backend, 'post').mockReturnValue(of({ isOk: true }));
    const visibilityChange = vi.spyOn(component.visibilityChange, 'emit');
    const toggle = fixture.nativeElement.querySelector('[role="switch"]') as HTMLButtonElement;

    toggle.click();

    expect(post).toHaveBeenCalledWith('beverageadmin/update/product-1', expect.objectContaining({
      isActive: false,
      title: 'محصول آزمایشی',
      price: 100,
    }));
    expect(visibilityChange).toHaveBeenCalledWith({
      product: component.product,
      showInMenu: false,
    });
  });
});
