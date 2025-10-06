import { z } from 'zod';

export const pageSchema =  z
        .string()
        .transform((value) => Math.max(Number(value), 1))
        .optional()