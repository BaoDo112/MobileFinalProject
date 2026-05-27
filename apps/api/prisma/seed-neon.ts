import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const timestamp = Date.now();
  console.log('Starting massive seed...');

  // 1. Organizers (5 records)
  const organizers = [];
  for (let i = 1; i <= 5; i++) {
    const org = await prisma.user.create({
      data: {
        email: `org_${timestamp}_${i}@arthera.local`,
        role: 'ORGANIZER',
        organizerProfile: { create: { name: `Demo Organizer ${i}`, organizationName: `Studio ${i}`, city: 'HCMC' } },
        accounts: { create: { provider: 'LOCAL', providerId: `org_${timestamp}_${i}` } },
        notificationPreference: { create: { emailAlerts: true } }
      }
    });
    organizers.push(org);
  }

  // 2. Visitors (15 records)
  const visitors = [];
  for (let i = 1; i <= 15; i++) {
    const vis = await prisma.user.create({
      data: {
        email: `visitor_${timestamp}_${i}@arthera.local`,
        role: 'VISITOR',
        visitorProfile: { create: { name: `Demo Visitor ${i}`, fullName: `Demo Visitor Full ${i}`, city: 'HCMC' } },
        accounts: { create: { provider: 'LOCAL', providerId: `visitor_${timestamp}_${i}` } },
        notificationPreference: { create: { emailAlerts: true, pushAlerts: true } }
      }
    });
    visitors.push(vis);
  }

  // 3. Venues (5 records)
  const venues = [];
  for (let i = 1; i <= 5; i++) {
    const venue = await prisma.venue.create({
      data: {
        title: `Exhibition Hall ${i}`,
        district: `District ${i}`,
        address: `${i}00 Fake Street`,
        city: 'Ho Chi Minh City'
      }
    });
    venues.push(venue);
  }

  // 4. Exhibitions (10 records: 2 per organizer)
  const exhibitions = [];
  for (let i = 0; i < 10; i++) {
    const exh = await prisma.exhibition.create({
      data: {
        title: `Amazing Exhibition ${i + 1}`,
        exhibitionType: i % 2 === 0 ? 'Art' : 'Technology',
        bio: `Neon test record ${i + 1}`,
        status: 'PUBLISHED',
        organizerId: organizers[i % 5].id,
        venueId: venues[i % 5].id
      }
    });
    exhibitions.push(exh);
  }

  // 5. Sessions, FormSchemas, Fields (20 sessions, 10 schemas, 20 fields)
  const sessions = [];
  const schemas = [];
  for (let i = 0; i < 10; i++) {
    const exh = exhibitions[i];
    
    // 2 sessions per exhibition
    for (let j = 1; j <= 2; j++) {
      const session = await prisma.exhibitionSession.create({
        data: {
          exhibitionId: exh.id,
          dateLabel: `2026-06-${10 + j}`,
          timeLabel: '10:00 - 12:00',
          capacity: 50,
          status: 'SCHEDULED'
        }
      });
      sessions.push(session);
    }

    // 1 form schema per exhibition
    const formSchema = await prisma.formSchemaVersion.create({
      data: {
        exhibitionId: exh.id,
        version: 1,
        isActive: true,
        consentTitle: 'Terms of Registration',
        fields: {
          create: [
            { type: 'TEXT', label: 'Why do you want to join?', order: 1 },
            { type: 'SELECT', label: 'How did you hear about us?', options: ['Facebook', 'Friend'], order: 2 }
          ]
        }
      },
      include: { fields: true }
    });
    schemas.push(formSchema);
  }

  // 6. Registrations, Answers, AttendanceLogs, Reviews, Stamps
  for (let i = 0; i < 20; i++) {
    const visitor = visitors[i % 15];
    const session = sessions[i];
    const exhibition = exhibitions[Math.floor(i / 2)];
    const schema = schemas[Math.floor(i / 2)];

    const registration = await prisma.registration.create({
      data: {
        sessionId: session.id,
        visitorId: visitor.id,
        formSchemaVersionId: schema.id,
        status: 'CHECKED_IN',
        note: `Guest ${i + 1}`,
        answers: {
          create: [
            { formFieldId: schema.fields[0].id, value: 'I love art' },
            { formFieldId: schema.fields[1].id, value: 'Friend' }
          ]
        },
        attendanceLog: {
          create: { note: 'Arrived on time' }
        }
      }
    });

    await prisma.review.create({
      data: {
        exhibitionId: exhibition.id,
        visitorId: visitor.id,
        rating: (i % 5) + 1, // 1 to 5 stars
        content: `Great experience ${i + 1}!`,
        status: 'PUBLISHED'
      }
    });

    await prisma.stamp.create({
      data: {
        visitorId: visitor.id,
        exhibitionId: exhibition.id,
        registrationId: registration.id,
        source: 'ATTENDANCE',
        vaultSection: 'CONFIRMED',
        title: `Art Explorer ${i + 1}`,
        milestone: 'Attendance Milestone',
        note: 'Checked in manually'
      }
    });
  }

  // 7. RuntimeState (10 records)
  for (let i = 1; i <= 10; i++) {
    await prisma.runtimeState.upsert({
      where: { key: `dummy-state-${timestamp}-${i}` },
      update: {},
      create: {
        key: `dummy-state-${timestamp}-${i}`,
        value: { seed: true, index: i, timestamp }
      }
    });
  }

  console.log('Successfully seeded 5-20 records for all tables into Neon DB!');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
