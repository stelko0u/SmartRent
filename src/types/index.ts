// This file exports TypeScript types and interfaces used in the application.

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
}

export interface Car {
    id: string;
    make: string;
    model: string;
    year: number;
    pricePerDay: number;
    ownerId: string;
    imageUrl: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Reservation {
    id: string;
    userId: string;
    carId: string;
    startDate: Date;
    endDate: Date;
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Payment {
    id: string;
    reservationId: string;
    amount: number;
    status: string;
    createdAt: Date;
}

export interface Notification {
    id: string;
    userId: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
}

export enum Role {
    USER = 'USER',
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
}