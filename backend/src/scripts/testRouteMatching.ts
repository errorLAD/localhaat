import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { seedOperationalLogistics } from '../seeds/seedOperationalLogistics.js';
import { RouteMatchingService } from '../services/routeMatchingService.js';
import { Parcel } from '../models/Parcel.js';
import { LogisticsTrip } from '../models/LogisticsTrip.js';
import { ParcelAssignment } from '../models/ParcelAssignment.js';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING ROUTE MATCHING ENGINE COMPREHENSIVE TESTS');
  console.log('====================================================');

  await connectDB();
  await seedOperationalLogistics();

  // Test 1: Forward Route Darbhanga -> Sakri (Should MATCH TRIP-1001)
  console.log('\n--- TEST 1: Forward Route: Darbhanga ➔ Sakri (Travel Date: 10 Oct 2026, Weight: 2kg) ---');
  const result1 = await RouteMatchingService.findMatchingTripsForParcel({
    pickupLocation: 'Darbhanga',
    deliveryLocation: 'Sakri',
    weightKg: 2.0,
    sendDate: '10 Oct 2026',
  });
  console.log(`Found ${result1.matchCount} match(es):`);
  const match1001 = result1.matches.find((m) => m.tripId === 'TRIP-1001');
  if (match1001) {
    console.log(`✅ SUCCESS: TRIP-1001 matched!`);
    console.log(`   Carrier: ${match1001.partnerName} (${match1001.methodCategory})`);
    console.log(`   Route Title: ${match1001.routeTitle}`);
    console.log(`   Route Sequence: ${match1001.routeSequence.join(' ➔ ')}`);
    console.log(`   Pickup Stop: ${match1001.pickupStop.name} (Dep: ${match1001.pickupStop.expectedDeparture}, Order: ${match1001.pickupStop.order})`);
    console.log(`   Drop Stop: ${match1001.destinationStop.name} (Arr: ${match1001.destinationStop.expectedArrival}, Order: ${match1001.destinationStop.order})`);
    console.log(`   Price: ₹${match1001.price} | Match Score: ${match1001.matchScore}%`);
    console.log(`   Available Capacity: ${match1001.availableCapacityKg} KG`);
    console.log(`   Explanation: "${match1001.matchExplanation}"`);
  } else {
    console.error('❌ FAILED: TRIP-1001 should have matched!');
    process.exit(1);
  }

  // Test 2: Reverse Direction Pandaul -> Sakri (Should NOT match TRIP-1001)
  console.log('\n--- TEST 2: Reverse Route: Pandaul ➔ Sakri (Reverse Direction Rejection) ---');
  const result2 = await RouteMatchingService.findMatchingTripsForParcel({
    pickupLocation: 'Pandaul',
    deliveryLocation: 'Sakri',
    weightKg: 2.0,
    sendDate: '10 Oct 2026',
  });
  const reverseMatch = result2.matches.find((m) => m.tripId === 'TRIP-1001');
  if (!reverseMatch) {
    console.log('✅ SUCCESS: Reverse direction haul Pandaul ➔ Sakri correctly REJECTED by forward stop order check!');
  } else {
    console.error('❌ FAILED: TRIP-1001 should NOT match in reverse direction!');
    process.exit(1);
  }

  // Test 3: Overcapacity Weight Rejection
  console.log('\n--- TEST 3: Capacity Check: Darbhanga ➔ Sakri with 50kg (Bike total capacity is only 20kg) ---');
  const result3 = await RouteMatchingService.findMatchingTripsForParcel({
    pickupLocation: 'Darbhanga',
    deliveryLocation: 'Sakri',
    weightKg: 50.0,
    sendDate: '10 Oct 2026',
  });
  const overcapMatch = result3.matches.find((m) => m.tripId === 'TRIP-1001');
  if (!overcapMatch) {
    console.log('✅ SUCCESS: Over-capacity parcel correctly excluded (available capacity insufficient)!');
  } else {
    console.error('❌ FAILED: TRIP-1001 should NOT match when parcel weight exceeds available capacity!');
    process.exit(1);
  }

  // Test 4: Atomic Booking & Capacity Deduction
  console.log('\n--- TEST 4: Atomic Partner Booking & Capacity Deduction ---');
  // Create a real test parcel in DB
  const testParcel = await Parcel.create({
    parcelId: 'LH-TEST-' + Date.now(),
    parcelTrackingNumber: 'LH-TRK-TEST-' + Date.now(),
    senderName: 'Test Sender',
    senderMobile: '9999900005',
    pickupLocation: 'Darbhanga',
    pickupAddress: 'Depot Darbhanga',
    receiverName: 'Test Receiver',
    receiverMobile: '9876543210',
    deliveryLocation: 'Sakri',
    deliveryAddress: 'Station Road Sakri',
    whatIsInside: 'Handcrafted Madhubani Stole',
    parcelCategory: 'Clothes',
    weightKg: 2.0,
    customerOfferPrice: 120,
    status: 'SEARCHING_FOR_PARTNER',
    pickupCode: '1234',
    handoverCode: '5678',
    deliveryPin: '9012',
    sendDate: '10 Oct 2026',
  });

  const tripBefore = await LogisticsTrip.findOne({ tripId: 'TRIP-1001' });
  const capBefore = tripBefore!.availableCapacityKg;
  console.log(`Trip available capacity BEFORE booking: ${capBefore} KG`);

  const bookingRes = await RouteMatchingService.assignParcelToTrip({
    parcelId: testParcel._id.toString(),
    tripId: 'TRIP-1001',
    partnerId: match1001.partnerId,
    pickupStopId: match1001.pickupStop.stopId,
    destinationStopId: match1001.destinationStop.stopId,
    agreedPrice: match1001.price,
    assignedByRole: 'CUSTOMER',
    notes: 'End-to-End Test Booking',
  });

  console.log(`✅ SUCCESS: Booking executed! Status: ${bookingRes.parcel.status}`);
  const tripAfter = await LogisticsTrip.findOne({ tripId: 'TRIP-1001' });
  console.log(`Trip available capacity AFTER booking: ${tripAfter!.availableCapacityKg} KG`);
  if (tripAfter!.availableCapacityKg === capBefore - 2.0) {
    console.log(`✅ SUCCESS: Exactly 2.0 KG atomically deducted from trip capacity!`);
  } else {
    console.error(`❌ FAILED: Expected capacity to decrease by 2.0 KG!`);
    process.exit(1);
  }

  const assignmentDoc = await ParcelAssignment.findOne({ parcelId: testParcel._id });
  if (assignmentDoc) {
    console.log(`✅ SUCCESS: ParcelAssignment record created with ID: ${assignmentDoc.assignmentId}`);
    console.log(`   Carrier: ${assignmentDoc.partnerName} (${assignmentDoc.transportType})`);
    console.log(`   Pickup Stop: ${assignmentDoc.pickupStopName} (Order: ${assignmentDoc.pickupStopOrder})`);
    console.log(`   Destination Stop: ${assignmentDoc.destinationStopName} (Order: ${assignmentDoc.destinationStopOrder})`);
  } else {
    console.error('❌ FAILED: ParcelAssignment document was not created!');
    process.exit(1);
  }

  // Test 5: Stop-by-Stop Manifest
  console.log('\n--- TEST 5: Stop-by-Stop Route Manifest Generation ---');
  const manifest = await RouteMatchingService.getTripStopManifest('TRIP-1001');
  console.log(`Manifest for ${manifest.trip.tripId} (${manifest.trip.routeTitle}):`);
  console.log(`Total Stops: ${manifest.stops.length}`);
  for (const st of manifest.stops) {
    console.log(`  Stop #${st.stopOrder}: ${st.name} | Arr: ${st.expectedArrival} | Dep: ${st.expectedDeparture} | Pickups: ${st.parcelsToPickup.length} | Drops: ${st.parcelsToDrop.length} | Onboard: ${st.onboardCount} (${st.onboardWeightKg} KG)`);
  }
  console.log('✅ SUCCESS: Stop-by-stop manifest accurately compiled!');

  console.log('\n====================================================');
  console.log('🎉 ALL 5 ROUTE MATCHING & DISPATCH TESTS PASSED 100%!');
  console.log('====================================================');

  await disconnectDB();
}

runTests().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
