import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/localhaat';

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db!;

  // 1. Update all partners to VERIFIED and active
  const partnerRes = await db.collection('logisticspartners').updateMany(
    { verificationStatus: { $ne: 'REJECTED' }, partnerStatus: { $nin: ['BLOCKED', 'SUSPENDED'] } },
    { $set: { isVerified: true, verificationStatus: 'VERIFIED', isActive: true } }
  );
  console.log(`Updated ${partnerRes.modifiedCount} partners to VERIFIED`);

  // 2. Update routes capacity to at least 50
  const routeRes = await db.collection('partnerroutes').updateMany(
    { capacityKg: { $lt: 50 } },
    { $set: { capacityKg: 50, availableCapacityKg: 50 } }
  );
  console.log(`Updated ${routeRes.modifiedCount} routes capacity to 50 KG`);

  // 3. Update trips capacity to at least 50
  const tripRes = await db.collection('logisticstrips').updateMany(
    { totalCapacityKg: { $lt: 50 } },
    { $set: { totalCapacityKg: 50, availableCapacityKg: 50 } }
  );
  console.log(`Updated ${tripRes.modifiedCount} trips capacity to 50 KG`);

  // 4. Test RouteMatchingService with user's exact query
  const { RouteMatchingService } = await import('../services/routeMatchingService.js');

  console.log('\n--- Testing with user screenshot query: Darbhanga -> madhibani, 30 KG, Today ---');
  const result = await RouteMatchingService.findMatchingTripsForParcel({
    pickupLocation: 'Darbhanga',
    deliveryLocation: 'madhibani',
    weightKg: 30,
    sendDate: 'Today',
    sendTime: 'Any Time (Flexible)',
  });

  console.log(`Matches found: ${result.matches.length}`);
  result.matches.forEach((m, idx) => {
    console.log(`Match #${idx + 1}:`, {
      partner: m.partnerName,
      tripId: m.tripId,
      route: m.routeTitle,
      pickup: m.pickupStop.name,
      dest: m.destinationStop.name,
      freeCapacity: m.availableCapacityKg,
      price: m.price,
      score: m.matchScore,
    });
  });

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Migration & test failed:', err);
  process.exit(1);
});
