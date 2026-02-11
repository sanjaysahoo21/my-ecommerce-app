import { z } from 'zod';

// Schema for adding an item to the cart
export const addToCartSchema = z.object({
    productId: z
        .string()
        .min(1, { message: 'productId is required' }),
    quantity: z
        .number()
        .int({ message: 'quantity must be an integer' })
        .min(1, { message: 'quantity must be at least 1' })
        .max(99, { message: 'quantity cannot exceed 99' }),
});

// Schema for removing an item from the cart
export const removeFromCartSchema = z.object({
    productId: z
        .string()
        .min(1, { message: 'productId is required' }),
});

// Schema for updating cart item quantity
export const updateCartItemSchema = z.object({
    productId: z
        .string()
        .min(1, { message: 'productId is required' }),
    quantity: z
        .number()
        .int({ message: 'quantity must be an integer' })
        .min(1, { message: 'quantity must be at least 1' })
        .max(99, { message: 'quantity cannot exceed 99' }),
});

// Type exports
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
