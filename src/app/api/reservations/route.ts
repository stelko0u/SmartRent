import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req) {
    const reservations = await prisma.reservation.findMany();
    return NextResponse.json(reservations);
}

export async function POST(req) {
    const { userId, vehicleId, startDate, endDate } = await req.json();
    
    const newReservation = await prisma.reservation.create({
        data: {
            userId,
            vehicleId,
            startDate,
            endDate,
        },
    });

    return NextResponse.json(newReservation, { status: 201 });
}

export async function PUT(req) {
    const { id, startDate, endDate } = await req.json();

    const updatedReservation = await prisma.reservation.update({
        where: { id },
        data: { startDate, endDate },
    });

    return NextResponse.json(updatedReservation);
}

export async function DELETE(req) {
    const { id } = await req.json();

    await prisma.reservation.delete({
        where: { id },
    });

    return NextResponse.json({ message: 'Reservation deleted' });
}