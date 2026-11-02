import { Routes } from '@angular/router';
import { Home } from './+components/page/home/home/home';

export const routes: Routes = [
    { path: 'home', component: Home },
    { path: '', redirectTo: 'home', pathMatch: 'full' },

    //کد کپی
    { path: 'login', loadComponent: () => import('./+components/Authentication/login/ui/login').then(m => m.Login) },
    {
        path: 'admin', canActivate: [adminGuard], children: [
            {
                path: '',
                loadComponent: () =>
                    import('./+components/admin/uiAdmin/admin')
                        .then(m => m.Admin)
            },
            {
                path: 'addfood',
                loadComponent: () =>
                    import('./+components/admin/add-food/add-food')
                        .then(m => m.AddFood)
            },
            {
                path: 'addnewadmin',
                loadComponent: () =>
                    import('./+components/Authentication/add-new-admin/add-new-admin')
                        .then(m => m.AddNewAdmin)
            },
            {
                path: 'changeUser',
                loadComponent: () =>
                    import('./+components/Authentication/change-user/ui/change-user')
                        .then(m => m.ChangeUser)
            },
            {
                path: 'changePas',
                loadComponent: () =>
                    import('./+components/Authentication/change-pas/ui/change-pas')
                        .then(m => m.ChangePas)
            },
            {
                path: 'addCategory',
                loadComponent: () =>
                    import('./+components/admin/add-category/add-category')
                        .then(m => m.AddCategory)
            },
            {
                path: 'productsAdmin',
                loadComponent: () =>
                    import('./+components/admin/products-admin/products-admin')
                        .then(m => m.ProductsAdmin)
            },
            {
                path: 'edit-beverage/:guid',
                loadComponent: () =>
                    import('./+components/admin/edit-beverage/edit-beverage')
                        .then(m => m.EditBeverage)
            }
        ]
    },+++
];
