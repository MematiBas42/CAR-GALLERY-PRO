import { MultiStepFormEnum } from "./types";

export const routes = {
    home: "/", 
    singleClassified: (slug: string) => `/inventory/${slug}`,
    reserve: (slug: string,step: MultiStepFormEnum) => `/inventory/${slug}/reserve?step=${step}`,
    reserveSuccess: (slug: string) => `/inventory/${slug}/success`,
    favourites: "/favourites",
    inventory: "/inventory",
    signIn: "/auth/sign-in",
    signUp: "/auth/sign-up",
    challenge: "/auth/challenge",
    admin:{
        dashboard: "/admin/dashboard",
        cars: "/admin/cars",
        customers: "/admin/customers",
        settings: "/admin/settings",
        editCar: (id:number ) => `/admin/cars/edit/${id}`,
        editCustomer: (id:number) => `/admin/customers/edit/${id}`,
    },
    notAvailable: (slug: string) => `/inventory/${slug}/not-available`,
}