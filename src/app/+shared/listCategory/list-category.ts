import { inject, Service, signal } from "@angular/core";
import { BackendService } from "../../+services/backend-service";

// اینترفیس دسته بندی
interface Category {
    guid: string;
    categoryTitle: string;
    isBeverage: boolean;
    iconPath: string;
}

@Service()
export class ListCategory {
    Backend = inject(BackendService);
    // apiName = ;
    listCategory() {
        return this.Backend.post('maingroup/list');
    }

    categories = signal<Category[]>([]);
    // استفاده نکردم
    // isLoading = signal<boolean>(false);

    //برای تداخل نخوردن درخاست های هم زمان
    private requestId = 0;

    list() {
        //درخاست جدید ارسال شده است
        const requestId = ++this.requestId;

        // this.isLoading.set(true);

        //درخاست دریافت کتگوری ها ارسال و جواب سابسکرایب میشه
        this.listCategory().subscribe({
            next: (res: any) => {
                //اگر شماره درخاست با شماره درخاست جدید یکی نبود پاسخ نشان داده نمی شود
                if (requestId !== this.requestId) {
                    return;
                }

                //برسی می کنیم که جواب بک اند ارایه بوده یا نه
                const payload = Array.isArray(res)
                    ? res
                    // برسی میکنیم که ارایه در چه ساختاری ارسال شده است
                    : res?.data ?? res?.result ?? res?.items ?? res?.categories ?? res?.value ?? [];

                // در این مرحله جواب بک اند رو به شکل دلخاه تبدیل میکنیم
                const normalized = Array.isArray(payload)
                    // دونه به دونه داخل ارایه رو بیرون بکش و اعمال خاسته شده رو اعمال کن
                    ? payload.map((item: any) => ({
                        guid: item?.guid ?? item?.id ?? '',
                        categoryTitle: item?.categoryTitle ?? item?.name ?? '',
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