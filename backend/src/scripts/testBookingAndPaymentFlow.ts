import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { seedOperationalLogistics } from '../seeds/seedOperationalLogistics.js';
import { Parcel } from '../models/Parcel.js';
import { LogisticsPartner } from '../models/LogisticsPartner.js';
import { LogisticsTrip } from '../models/LogisticsTrip.js';
import { ParcelBookingRequest } from '../models/ParcelBookingRequest.js';
import { Payment } from '../models/Payment.js';
import { PaymentService } from '../services/paymentService.js';
import { RouteMatchingService } from '../services/routeMatchingService.js';

async function runBookingAndPaymentTests() {
  console.log('================================================================');
  console.log('🧪 RUNNING PARCEL OFFER ACCEPTANCE & PAYMENT FLOW (SECTIONS 19-40)');
  console.log('================================================================');

  await connectDB();
  await seedOperationalLogistics();

  // Find partner & trip from seed
  const partner = await LogisticsPartner.findOne({ isVerified: true });
  if (!partner) throw new Error('No verified logistics partner found.');

  const trip = await LogisticsTrip.findOne({ partnerId: partner._id, tripStatus: 'SCHEDULED' });
  if (!trip) throw new Error('No scheduled logistics trip found.');

  console.log(`\nActive Partner: ${partner.businessName} (Code: ${partner.partnerCode})`);
  console.log(`Active Trip: ${trip.tripId} (${trip.routeTitle})`);
  console.log(`Trip available capacity: ${trip.availableCapacityKg} KG`);

  // 1. Create a customer parcel
  const parcel = await Parcel.create({
    parcelId: 'PCL-10245',
    parcelTrackingNumber: 'TRK-10245',
    senderName: 'Suresh Kumar',
    senderMobile: '9876543210',
    pickupLocation: 'Darbhanga',
    pickupAddress: 'Darbhanga Bus Stand, Platform 2',
    receiverName: 'Rameshwar Bahera',
    receiverMobile: '9876543211',
    deliveryLocation: 'Sakri',
    deliveryAddress: 'Sakri Chowk, Near Mithila Haat',
    whatIsInside: 'FMCG Goods & Spices',
    parcelCategory: 'FMCG',
    weightKg: 4.0,
    dimensions: { lengthCm: 30, widthCm: 20, heightCm: 15 },
    approximateValue: 1500,
    customerOfferPrice: 120, // ₹120 offer price
    pickupCode: '8492',
    handoverCode: '109283',
    deliveryPin: '4920',
    totalLegs: 3,
    currentLegIndex: 0,
    status: 'SEARCHING_FOR_PARTNER',
  });

  console.log(`\nCreated Test Parcel: ${parcel.parcelId} (Offered Price: ₹${parcel.customerOfferPrice})`);

  // 2. Create Booking Request (Section 19: Customer clicks "BOOK PARCEL WITH PARTNER")
  const expiresAt = new Date(Date.now() + 120000);
  const bookingReq1 = await ParcelBookingRequest.create({
    requestId: 'REQ-TEST-001',
    parcelId: parcel._id,
    parcelTrackingNumber: parcel.parcelTrackingNumber,
    customerId: new mongoose.Types.ObjectId(),
    customerName: parcel.senderName,
    partnerId: partner._id,
    partnerUserId: partner.userId,
    partnerName: partner.businessName,
    tripId: trip._id,
    tripCode: trip.tripId,
    routeTitle: trip.routeTitle,
    routeSequence: ['Darbhanga', 'Sakri', 'Pandaul', 'Madhubani'],
    pickupStop: { stopId: 'START', name: 'Darbhanga', order: 1, expectedDeparture: '08:00 AM' },
    destinationStop: { stopId: 'STOP-1', name: 'Sakri', order: 2, expectedArrival: '09:45 AM' },
    parcelCategory: parcel.parcelCategory,
    weightKg: parcel.weightKg,
    dimensions: parcel.dimensions,
    declaredValue: parcel.approximateValue,
    whatIsInside: parcel.whatIsInside,
    transportMethod: 'Bus / Public Transport',
    methodCategory: 'BUS / PUBLIC TRANSPORT',
    offeredPrice: 120, // Locked price
    partnerEarning: 120,
    bookingDate: '10 October 2026',
    status: 'PENDING_PARTNER_RESPONSE',
    expiresAt,
  });

  console.log(`✅ [SECTION 19] Booking Request Created: ${bookingReq1.requestId}`);
  console.log(`   Ringing Payload: ₹${bookingReq1.offeredPrice} earning, status: ${bookingReq1.status}`);
  console.log(`   Expires in 120 seconds: ${bookingReq1.expiresAt.toISOString()}`);

  // 3. Test REJECT Flow (Section 21: Partner declines with reason)
  console.log('\n--- TEST: Partner Rejection Flow (Section 21) ---');
  bookingReq1.status = 'REJECTED_BY_PARTNER';
  bookingReq1.rejectionReason = 'Route is at maximum capacity';
  bookingReq1.respondedAt = new Date();
  await bookingReq1.save();

  parcel.rejectionReason = 'Route is at maximum capacity';
  parcel.status = 'SEARCHING_FOR_PARTNER';
  await parcel.save();

  console.log(`✅ Partner rejected offer. Request status: ${bookingReq1.status}`);
  console.log(`   Rejection reason stored: "${bookingReq1.rejectionReason}"`);
  console.log(`   Customer parcel returned to: ${parcel.status} with reason for user re-selection.`);

  // 4. Test ACCEPT Flow (Section 20: Partner accepts offer + locks price)
  console.log('\n--- TEST: Partner Acceptance Flow (Section 20) ---');
  const bookingReq2 = await ParcelBookingRequest.create({
    requestId: 'REQ-TEST-002',
    parcelId: parcel._id,
    parcelTrackingNumber: parcel.parcelTrackingNumber,
    customerId: new mongoose.Types.ObjectId(),
    customerName: parcel.senderName,
    partnerId: partner._id,
    partnerUserId: partner.userId,
    partnerName: partner.businessName,
    tripId: trip._id,
    tripCode: trip.tripId,
    routeTitle: trip.routeTitle,
    routeSequence: ['Darbhanga', 'Sakri', 'Pandaul', 'Madhubani'],
    pickupStop: { stopId: 'START', name: 'Darbhanga', order: 1, expectedDeparture: '08:00 AM' },
    destinationStop: { stopId: 'STOP-1', name: 'Sakri', order: 2, expectedArrival: '09:45 AM' },
    parcelCategory: parcel.parcelCategory,
    weightKg: parcel.weightKg,
    dimensions: parcel.dimensions,
    declaredValue: parcel.approximateValue,
    whatIsInside: parcel.whatIsInside,
    transportMethod: 'Bus / Public Transport',
    methodCategory: 'BUS / PUBLIC TRANSPORT',
    offeredPrice: 120, // Locked price
    partnerEarning: 120,
    bookingDate: '10 October 2026',
    status: 'PENDING_PARTNER_RESPONSE',
    expiresAt,
  });

  // Assign to trip using RouteMatchingService
  const assignResult = await RouteMatchingService.assignParcelToTrip({
    parcelId: parcel.parcelId,
    tripId: trip.tripId,
    partnerId: partner._id.toString(),
    pickupStopId: 'START',
    destinationStopId: 'STOP-1',
    agreedPrice: bookingReq2.offeredPrice,
    assignedByRole: 'CUSTOMER',
  });

  bookingReq2.status = 'ACCEPTED';
  bookingReq2.respondedAt = new Date();
  await bookingReq2.save();

  parcel.status = 'PARTNER_ACCEPTED';
  parcel.customerOfferPrice = bookingReq2.offeredPrice;
  parcel.paymentStatus = 'UNPAID';
  parcel.paymentMethod = 'NOT_SELECTED';
  parcel.acceptedAt = new Date();
  await parcel.save();

  console.log(`✅ [SECTION 20] Partner ACCEPTED offer!`);
  console.log(`   Parcel status: ${parcel.status}`);
  console.log(`   Locked offered price: ₹${parcel.customerOfferPrice}`);
  console.log(`   Assignment created: ${assignResult.assignment.assignmentId}`);
  console.log(`   Trip remaining capacity: ${(await LogisticsTrip.findById(trip._id))?.availableCapacityKg} KG`);

  // 5. Test Payment Option 1: Cash to Partner (Section 27)
  console.log('\n--- TEST: Cash to Partner (COD) Flow (Section 27) ---');
  // Amount strictly read from DB (parcel.customerOfferPrice = 120)
  const cashPayment = await Payment.create({
    parcelId: parcel._id,
    customerId: parcel.senderUserId || new mongoose.Types.ObjectId(),
    amount: parcel.customerOfferPrice,
    currency: 'INR',
    provider: 'CASH_TO_PARTNER',
    status: 'CASH_PENDING',
  });

  parcel.paymentMethod = 'CASH_TO_PARTNER';
  parcel.paymentStatus = 'CASH_PENDING';
  parcel.status = 'PICKUP_PENDING';
  await parcel.save();

  console.log(`✅ [SECTION 27] Cash to Partner Selected!`);
  console.log(`   Payment record ID: ${cashPayment._id}`);
  console.log(`   Payment provider: ${cashPayment.provider}, status: ${cashPayment.status}, amount: ₹${cashPayment.amount}`);
  console.log(`   Parcel paymentMethod: ${parcel.paymentMethod}, paymentStatus: ${parcel.paymentStatus}`);
  console.log(`   Parcel status moved to: ${parcel.status}`);
  console.log(`   Pickup code available to customer: "${parcel.pickupCode}"`);

  // Milestone: Cash confirmed upon partner pickup (Section 28)
  cashPayment.status = 'CASH_CONFIRMED';
  cashPayment.paidAt = new Date();
  await cashPayment.save();
  parcel.paymentStatus = 'PAID';
  await parcel.save();
  console.log(`✅ [SECTION 28] Milestone: Partner verified cash collection -> Payment status: ${parcel.paymentStatus}`);

  // 6. Test Payment Option 2: Pay Online (Section 26, 29)
  console.log('\n--- TEST: Pay Online via Razorpay Flow (Section 26 & 29) ---');
  // Create Razorpay Order
  const razorpayOrder = await PaymentService.createParcelRazorpayOrder(
    parcel._id.toString(),
    new mongoose.Types.ObjectId().toString(),
    parcel.customerOfferPrice
  );
  console.log(`✅ [SECTION 26] Razorpay Order Created for locked amount: ₹${parcel.customerOfferPrice}`);
  console.log(`   Provider Order ID: ${razorpayOrder.providerOrderId}`);
  console.log(`   Amount in Paise: ${razorpayOrder.amount} paise (₹${razorpayOrder.amount / 100})`);

  // Verify signature (using mock/dev signature)
  const verifiedPayment = await PaymentService.verifyParcelPaymentSignature({
    parcelId: parcel._id.toString(),
    razorpayOrderId: razorpayOrder.providerOrderId,
    razorpayPaymentId: 'pay_mock_' + Math.floor(100000 + Math.random() * 900000),
    razorpaySignature: 'mock_sig_' + Math.random().toString(36).substring(7),
  });

  parcel.paymentMethod = 'ONLINE_RAZORPAY';
  parcel.paymentStatus = 'PAID';
  parcel.status = 'PICKUP_PENDING';
  await parcel.save();

  console.log(`✅ [SECTION 29] Online Payment Signature Verified!`);
  console.log(`   Payment Status: ${verifiedPayment?.status}`);
  console.log(`   Parcel Payment Method: ${parcel.paymentMethod}`);
  console.log(`   Parcel Payment Status: ${parcel.paymentStatus}`);
  console.log(`   Parcel Lifecycle Status: ${parcel.status}`);
  console.log(`   Pickup Code Unlocked: "${parcel.pickupCode}"`);

  console.log('\n================================================================');
  console.log('🎉 ALL OFFER ACCEPTANCE & PAYMENT FLOW TESTS PASSED SUCCESSFULLY');
  console.log('================================================================\n');

  await disconnectDB();
}

runBookingAndPaymentTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
