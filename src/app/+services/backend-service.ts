import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { environment } from "../../environments/environment.development";

@Service()
export class BackendService {
    http = inject(HttpClient);
    //	آدرس اصلی بک‌اند
    apiUrl = environment.apiUrl;
    //	 آدرس تصاویر
    photoAddress = '';
    //ارسال اطلاعات جدید به بک‌اند
    post(api: string, data?: any) {
        return this.http.post(environment.apiUrl + api, data);
    }
    //دریافت اطلاعات از بک‌اند
    getCatOrPr(api: string) {
        return this.http.get(environment.apiUrl + api)
    }



    //ارسال اطلاعات همراه فایل برای عکس به بک‌اند
    postForm(api: string, formData: FormData) {
        return this.http.post(environment.apiUrl + api, formData)
    };      
    //	ویرایش و به‌روزرسانی اطلاعات در بک‌اند
    put(api: string, data: any) {
        return this.http.put(environment.apiUrl + api, data)
    };
    delete(api: string) {
        return this.http.delete(environment.apiUrl + api)
    };
}