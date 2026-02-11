// Global type definitions for the application

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    inStock: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CartProduct {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    inStock: boolean;
}

export interface CartItem {
    id: string;
    quantity: number;
    productId: string;
    product: CartProduct;
}

export interface Cart {
    id: string;
    items: CartItem[];
    total: number;
    itemCount: number;
}

export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    pageSize: number;
}

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    details?: Array<{ field: string; message: string }>;
}
