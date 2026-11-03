import { inject, Service } from '@angular/core';
import { BackendService } from '../../../../+services/backend-service';
import { AddCategoryRequest } from '../../add-category/model/add-category-request';
import { HttpHeaders } from '@angular/common/http';

@Service()
export class CardAdminService {
    backend = inject(BackendService);
    apiName = '';
    guid :string | number | undefined;
    removeFood(data: AddCategoryRequest, token?: string | null) {
        this.apiName='maincourceadmin/remove/'
        return this.backend.post(`${this.apiName}${this.guid}`);
    }
    removeBeverage(data: AddCategoryRequest, token?: string | null) {
        this.apiName='beverageadmin/remove/'
        return this.backend.post(`${this.apiName}${this.guid}`);
    }
}
