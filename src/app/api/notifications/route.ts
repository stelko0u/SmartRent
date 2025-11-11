import { NextResponse } from 'next/server';
import { sendNotification } from '@/lib/notifications'; // Assuming you have a notification service

export async function POST(request: Request) {
    const { userId, message } = await request.json();

    if (!userId || !message) {
        return NextResponse.json({ error: 'User ID and message are required' }, { status: 400 });
    }

    try {
        await sendNotification(userId, message);
        return NextResponse.json({ success: true, message: 'Notification sent successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
    }
}