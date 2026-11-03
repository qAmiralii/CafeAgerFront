import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { environment } from "../../environments/environment.development";

@Service()
export class BackendService {
    http = inject(HttpClient);
    apiUrl = environment.apiUrl;
    photoAddress = '';
    post(api: string, data?: any) {
        return this.http.post(environment.apiUrl + api, data);
    }
    getCatOrPr(api: string) {
        return this.http.get(environment.apiUrl + api)
    }



    //
    postForm(api: string, formData: FormData) {
        return this.http.post(environment.apiUrl + api, formData)
    };      
    put(api: string, data: any) {
        return this.http.put(environment.apiUrl + api, data)
    };
    delete(api: string) {
        return this.http.delete(environment.apiUrl + api)
    };
}