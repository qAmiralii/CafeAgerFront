import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { environment } from "../../environments/environment.development";

@Service()
export class BackendService {
    http = inject(HttpClient);
    apiUrl = environment.apiUrl;
    photoAddress = '';
    getCatOrPr(api: string) {
        return this.http.get(environment.apiUrl + api)
    }
    post(api: string,data:any){
        return this.http.post(environment.apiUrl + api , data);
    }
}