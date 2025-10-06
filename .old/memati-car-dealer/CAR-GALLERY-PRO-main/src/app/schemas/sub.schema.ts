import { z } from "zod";
export const SubscribeSchema = z.object({

    
    email: z.string().email(),
    firstName: z.string().min(1, "Name is required"),
    lastName: z.string().min(1, "Last name is required"),

})