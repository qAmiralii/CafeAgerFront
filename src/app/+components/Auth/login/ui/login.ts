import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoginService } from '../service/login.service';
import { LoginRequest } from '../model/Login.request';
import { LoginOk } from '../model/Login.ok';
import { AddCategory } from '../../../admin/add-category/add-category';

@Component({
  imports: [CommonModule, FormsModule, RouterLink, AddCategory],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  loginser = inject(LoginService);
  router = inject(Router);
  readonly errorMessage = signal<string | null>(null);
  showPassword = false;
  loginData: LoginRequest = {
    username: '',
    password: ''
  };
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  onSubmit() {
    this.loginser.login(this.loginData).subscribe({
      next: (res: any) => {
        if (res.isOk === true && res.token) {
          const response = res as LoginOk;
          this.loginser.setToken(response.token, response.msg, response.isOk, response.expiresIn )
          if (res.isChanged==false) {
            this.router.navigate(['admin/changeUser']);
          } else {
            this.router.navigate(['/admin']);
          }
        } else {
          this.errorMessage.set('نام کاربری یا کلمه عبور صحیح نیست')
        }
      },
      error: (erro) => {
        this.errorMessage.set('برقراری ارتباط با سرویس دهنده امکانپذیر نمی باشد')
      }
    });
  }
}
