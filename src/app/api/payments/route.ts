import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '../../../lib/stripe';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { amount, currency, source, reservationId } = req.body;

        try {
            // Create a payment intent with the order amount and currency
            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency,
                payment_method: source,
                confirm: true,
            });

            // Update the reservation status in the database
            await prisma.reservation.update({
                where: { id: reservationId },
                data: { status: 'paid' },
            });

            res.status(200).json({ success: true, paymentIntent });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}