import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AddCategoryRequest } from './model/add-category-request';
import { AddCategoryService } from './service/add-category.service';

@Component({
  selector: 'app-add-category',
  imports: [FormsModule, RouterLink],
  templateUrl: './add-category.html',
  styleUrl: './add-category.css',
})
export class AddCategory {
  private addCategoryService = inject(AddCategoryService);
  private router = inject(Router);

  isBeverage = false;

  categoryModel = signal<AddCategoryRequest>({
    categoryTitle: '',
    isBeverage: false,
    file: undefined,
  });

  imagePreview = signal<string | null>(null);
  selectedFile = signal<File | null>(null);

  nameTouched = signal(false);
  imageTouched = signal(false);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.selectedFile.set(file);
    this.imageTouched.set(true);

    this.categoryModel.update((model) => ({
      ...model,
      file: file,
    }));
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    this.nameTouched.set(true);

    const model = this.categoryModel();

    if (!model.categoryTitle?.trim()) {
      return;
    }

    const formData = new FormData();

    formData.append('CategoryTitle', model.categoryTitle.trim());
    formData.append(
      'IsBeverage',
      String(this.isBeverage)
    );

    const file = this.selectedFile();

    if (file) {
      formData.append('File', file, file.name);
    }

    this.addCategoryService.addCategory(formData).subscribe({
      next: () => {
        this.router.navigate(['/admin']);
      },
      error: (error) => {
        console.error('Failed to add category', error);
      },
    });
  }
}
