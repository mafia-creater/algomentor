import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma' // Make sure you have a prisma client instance configured

export async function POST(req: Request) {
  console.log('🔔 Clerk webhook endpoint called');
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('❌ Missing CLERK_WEBHOOK_SECRET');
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");
  console.log('Headers:', { svix_id, svix_timestamp, svix_signature });

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('❌ Missing svix headers', { svix_id, svix_timestamp, svix_signature });
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);
  console.log('Received webhook payload:', payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
    console.log('✅ Webhook verified. Event type:', evt.type);
  } catch (err) {
    console.error('❌ Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }

  // Handle the event
  const eventType = evt.type;

  try {
    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name } = evt.data;
      console.log(`🔍 user.created event for id=${id}, email=${email_addresses?.[0]?.email_address}`);
      // Prevent duplicate user creation
      const existingUser = await prisma.user.findUnique({
        where: { externalId: id },
      });
      if (!existingUser) {
        await prisma.user.create({
          data: {
            externalId: id,
            email: email_addresses[0].email_address,
            name: `${first_name} ${last_name}`.trim(),
          },
        });
        console.log(`✅ Created user ${id} in our database.`);
      } else {
        console.log(`ℹ️ User ${id} already exists in our database.`);
      }
    } else if (eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = evt.data;
      console.log(`🔍 user.updated event for id=${id}, email=${email_addresses?.[0]?.email_address}`);
      await prisma.user.update({
        where: { externalId: id },
        data: {
          email: email_addresses[0].email_address,
          name: `${first_name} ${last_name}`.trim(),
        },
      });
      console.log(`✅ Updated user ${id} in our database.`);
    } else if (eventType === 'user.deleted') {
      const { id } = evt.data;
      console.log(`🔍 user.deleted event for id=${id}`);
      await prisma.user.delete({
        where: { externalId: id },
      });
      console.log(`✅ Deleted user ${id} from our database.`);
    } else {
      console.log(`ℹ️ Unhandled Clerk event type: ${eventType}`);
    }
  } catch (err) {
    console.error('❌ Database error:', err);
    return new Response('Database error', { status: 500 });
  }

  return new Response('', { status: 200 });
}