import { inject, Service } from "@angular/core";
import { BackendService } from "../../../../+services/backend-service";




@Service()
export class LoginService {
    backend = inject(BackendService);
    apiName = 'users/login';
    login(data: any) {
        return this.backend.post(`${this.apiName}`, data)
    }
    private dispatchAuthStateChanged(): void {
        window.dispatchEvent(new Event('auth:changed'));
    }
    setToken(token: string, msg: string, isOk: boolean, expiresIn: Date) {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('msg', msg);
        sessionStorage.setItem('isOk', isOk.toString());
        sessionStorage.setItem('expiresIn', expiresIn.toString());
        this.dispatchAuthStateChanged();
    }
    unsetToken() {
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('msg')
        sessionStorage.removeItem('isOk')
        sessionStorage.removeItem('expiresIn')
        this.dispatchAuthStateChanged();
    }
    isLogin() {
        return sessionStorage.getItem('token') != undefined;
    }
}
