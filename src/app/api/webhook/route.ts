import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { createBooking, updateHotelRoom } from '@/libs/apis';

const checkout_session_completed = 'checkout.session.completed';
const payment_intent_succeeded = 'payment_intent.succeeded';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(req: Request, res: Response) {
  const reqBody = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) return;
    event = stripe.webhooks.constructEvent(reqBody, sig, webhookSecret);
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 500 });
  }

  // load our event
  console.log('Event type received:', event.type);
  
  switch (event.type) {
    case checkout_session_completed:
      const session = event.data.object;

      // Retrieve full session from Stripe to get metadata
      const fullSession = await stripe.checkout.sessions.retrieve(session.id);

      console.log('Full session retrieved:', fullSession);
      console.log('Session metadata:', fullSession.metadata);

      // Extract metadata dengan type assertion
      const metadata = fullSession.metadata as any;
      
      if (!metadata || Object.keys(metadata).length === 0) {
        console.log('No metadata found in session - likely a test session');
        return NextResponse.json('Test session processed', {
          status: 200,
          statusText: 'Test Session Processed',
        });
      }

      const {
        adults,
        checkinDate,
        checkoutDate,
        children,
        hotelRoom,
        numberOfDays,
        user,
        discount,
        totalPrice,
      } = metadata;

      try {
        console.log('Full metadata received:', metadata);
        console.log('hotelRoom from metadata:', metadata.hotelRoom);

        await createBooking({
          adults: Number(adults),
          checkinDate,
          checkoutDate,
          children: Number(children),
          hotelRoom,
          numberOfDays: Number(numberOfDays),
          discount: Number(discount),
          totalPrice: Number(totalPrice),
          user,
        });

        console.log('Booking created successfully');

        //   Update hotel Room
        if (hotelRoom) {
          console.log('Updating hotel room:', hotelRoom);
          await updateHotelRoom(hotelRoom);
          console.log('Hotel room updated successfully');
        } else {
          console.log('No hotelRoom found in metadata, skipping update');
        }

      } catch (error: any) {
        console.error('Error in webhook processing:', error);
        return new NextResponse(`Webhook processing error: ${error.message}`, { status: 500 });
      }

      return NextResponse.json('Booking successful', {
        status: 200,
        statusText: 'Booking Successful',
      });

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json('Event Received', {
    status: 200,
    statusText: 'Event Received',
  });
}