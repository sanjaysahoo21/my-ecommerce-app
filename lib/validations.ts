import { z } from 'zod';

// Schema for adding an item to the cart
export const addToCartSchema = z.object({
    productId: z
        .string({
            required_error: 'productId is required',
            invalid_type_error: 'productId must be a string',
        })
        .min(1, 'productId cannot be empty'),
    quantity: z
        .number({
            required_error: 'quantity is required',
            invalid_type_error: 'quantity must be a number',
        })
        .int('quantity must be an integer')
        .min(1, 'quantity must be at least 1')
        .max(99, 'quantity cannot exceed 99'),
});

// Schema for removing an item from the cart
export const removeFromCartSchema = z.object({
    productId: z
        .string({
            required_error: 'productId is required',
            invalid_type_error: 'productId must be a string',
        })
        .min(1, 'productId cannot be empty'),
});

// Schema for updating cart item quantity
export const updateCartItemSchema = z.object({
    productId: z
        .string({
            required_error: 'productId is required',
            invalid_type_error: 'productId must be a string',
        })
        .min(1, 'productId cannot be empty'),
    quantity: z
        .number({
            required_error: 'quantity is required',
            invalid_type_error: 'quantity must be a number',
        })
        .int('quantity must be an integer')
        .min(1, 'quantity must be at least 1')
        .max(99, 'quantity cannot exceed 99'),
});

// Type exports
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
