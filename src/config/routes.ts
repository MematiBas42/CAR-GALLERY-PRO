import { MultiStepFormEnum } from "./types";

export const routes = {
    home: "/", 
    singleClassified: (slug: string) => `/inventory/${slug}`,
    reserve: (slug: string,step: MultiStepFormEnum) => `/inventory/${slug}/reserve?step=${step}`,
    reserveSuccess: (slug: string) => `/inventory/${slug}/success`,
    favourites: "/favourites",
    inventory: "/inventory",
    financing: "/financing",
    ourPhilosophy: "/our-philosophy",
    contact: "/contact",
    signIn: "/auth/sign-in",
    signUp: "/auth/sign-up",
    challenge: "/auth/challenge",
    admin:{
        dashboard: "/admin/dashboard",
        cars: "/admin/cars",
        newCar: "/admin/cars/new",
        customers: "/admin/customers",
        newCustomer: "/admin/customers/new",
        messages: "/admin/messages",
    subscribers: "/admin/subscribers",
    emailTemplates: "/admin/email-templates",
    users: "/admin/users",
    settings: "/admin/settings",
  },
    notAvailable: (slug: string) => `/inventory/${slug}/not-available`,
}