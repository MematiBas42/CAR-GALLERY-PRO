import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedTemplates() {
  console.log('Seeding email templates...');

  const templates = [
    {
      name: 'Reservation Confirmation',
      subject: 'Booking Confirmation - RIM GLOBAL',
      content: `<h1>Hello {{name}},</h1>
<p>We received your booking for <strong>{{carTitle}}</strong> on {{date}}.</p>
<p>Our team will contact you shortly to confirm the details.</p>
<br/>
<p>Best regards,<br/>The RIM GLOBAL Team</p>`
    },
    {
      name: 'Welcome Subscriber',
      subject: 'Welcome to RIM GLOBAL Newsletter',
      content: `<h1>Welcome {{name}}!</h1>
<p>Thank you for subscribing to our newsletter. You will be the first to know about our latest arrivals and exclusive offers.</p>
<br/>
<p>Best regards,<br/>The RIM GLOBAL Team</p>`
    },
    {
      name: 'Price Drop Alert',
      subject: 'Price Drop Alert: {{carTitle}}',
      content: `<h1>Good News {{name}}!</h1>
<p>The price for <strong>{{carTitle}}</strong> has dropped!</p>
<p>New Price: <strong>{{newPrice}}</strong></p>
<p>Don't miss out on this opportunity.</p>
<br/>
<a href="{{link}}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Vehicle</a>`
    },
    {
      name: 'New Inventory Arrival',
      subject: 'New Arrival: {{carTitle}}',
      content: `<h1>Check out our latest arrival!</h1>
<p>We just added a <strong>{{carTitle}}</strong> to our inventory.</p>
<p>{{description}}</p>
<br/>
<a href="{{link}}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Details</a>`
    }
  ];

  for (const template of templates) {
    const existing = await prisma.emailTemplate.findFirst({
      where: { name: template.name }
    });

    if (!existing) {
      await prisma.emailTemplate.create({
        data: template
      });
      console.log(`Created template: ${template.name}`);
    } else {
      console.log(`Template already exists: ${template.name}`);
    }
  }
}

seedTemplates()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
