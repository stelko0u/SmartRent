import { z } from 'zod';

export const userSignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6).refine((val, ctx) => {
    if (val !== ctx.parent.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords don't match",
      });
      return false;
    }
    return true;
  }),
});

export const vehicleSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().min(1886).max(new Date().getFullYear()),
  pricePerDay: z.number().positive(),
  imageUrl: z.string().url(),
});

export const reservationSchema = z.object({
  vehicleId: z.string().uuid(),
  startDate: z.date(),
  endDate: z.date().refine((date) => date > new Date(), {
    message: "End date must be in the future",
  }),
  userId: z.string().uuid(),
});