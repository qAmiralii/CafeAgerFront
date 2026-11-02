import { inject, Service, signal } from "@angular/core";
import { BackendService } from "../../+services/backend-service";

// اینترفیس دسته بندی
interface Category {
    guid: string;
    Title: string;
    isBeverage: boolean;
    iconPath: string;
}

@Service()
export class ListCategory {
    Backend = inject(BackendService);
    // apiName = ;
    listCategory() {
        return this.Backend.getCatOrPr('maingroup/list');
    }
    categories = signal<Category[]>([]);
    isLoading = signal<boolean>(false);
    private requestId = 0;

    list() {
        const requestId = ++this.requestId;
        const startedAt = Date.now();
        this.isLoading.set(true);
        this.listCategory().subscribe({
            next: (res: any) => {
                if (requestId !== this.requestId) {
                    return;
                }

                // برسی شود
                const payload = Array.isArray(res)
                    ? res
                    : res?.data ?? res?.result ?? res?.items ?? res?.categories ?? res?.value ?? [];

                const normalized = Array.isArray(payload)
                    ? payload.map((item: any) => ({
                        guid: item?.guid ?? item?.id ?? '',
                        Title: item?.categoryTitle ?? item?.title ?? item?.name ?? '',
                        isBeverage: item?.isBeverage === true || item?.isBeverage === 'true',
                        iconPath: item?.iconPath ?? item?.imagePath ?? item?.image ?? '',
                    }))
                    : [];
                // تا اینجا

                this.categories.set(normalized);
            }
        })
    }


}