import { inject, Service } from '@angular/core';
import { BackendService } from '../../../../+services/backend-service';

@Service()
export class AdminService {
    backend = inject(BackendService);
    apiName = 'maingroup/list';

    removeCategory(guid: string) {
        return this.backend.post(`maingroup/remove/${guid}`);
    }
}
