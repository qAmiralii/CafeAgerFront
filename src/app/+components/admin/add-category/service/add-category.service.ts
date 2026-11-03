import { inject, Service } from '@angular/core';
import { BackendService } from '../../../../+services/backend-service';

@Service()
export class AddCategoryService {
    backend = inject(BackendService);
    apiName = 'maingroup/add';

    addCategory(data: FormData) {

        return this.backend.post(`${this.apiName}`, data);
    }
}
