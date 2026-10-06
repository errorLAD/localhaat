import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import {
  Parcel,
  ParcelEvent,
  ShipmentLeg,
  HandoverRecord,
  LogisticsPartner,
  Vehicle,
  VillageAgent,
  User,
  Earning,
  Payment,
  ParcelDispute,
  AdminAuditLog,
} from '../models/index.js';

export const seedOperationalParcels = async () => {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  console.log('[SeedParcels] Checking database for partners and agents...');

  let partner = await LogisticsPartner.findOne().populate('userId').populate('vehicleIds');
  let vehicle = await Vehicle.findOne();
  let agent = await VillageAgent.findOne({ hubCode: 'VH-BR-0321' }).populate('userId'); // Manohar Jha
  if (!agent) {
    agent = await VillageAgent.findOne().populate('userId');
  }
  let customerUser = await User.findOne({ role: 'customer' }) || await User.findOne();
  let adminUser = await User.findOne({ role: 'admin' }) || await User.findOne();

  if (!partner || !agent) {
    console.log('[SeedParcels] Missing partner or agent, skipping creation.');
    return;
  }

  console.log(`[SeedParcels] Partner: ${partner.businessName}, Agent: ${agent.villageName} (${agent.hubCode})`);

  console.log('[SeedParcels] Seeding operational parcels...');

  const operationalParcelsData = [
    // 1. Unbooked / Searching Partner (>35 mins ago for alert)
    {
      parcelId: 'LH-PKG-401001',
      parcelTrackingNumber: 'LH-TRK-401001',
      senderName: 'Sunil Kumar Mahto',
      senderMobile: '9835012345',
      pickupLocation: 'Madhubani Town',
      pickupAddress: 'Shop 12, Station Road, Madhubani',
      receiverName: 'Ramesh Mishra',
      receiverMobile: '9835098765',
      deliveryLocation: 'Gajahra Village',
      deliveryAddress: 'Ward 4, Near High School, Gajahra',
      whatIsInside: 'Handcrafted Madhubani Painting & Silk Dupatta',
      parcelCategory: 'Art & Handicrafts',
      weightKg: 2.2,
      dimensions: { lengthCm: 40, widthCm: 30, heightCm: 10 },
      approximateValue: 3200,
      customerOfferPrice: 220,
      preferredLogisticsType: 'Bike',
      status: 'SEARCHING_FOR_PARTNER',
      pickupCode: '1029',
      handoverCode: '4019',
      deliveryPin: '5812',
      currentLegIndex: 0,
      totalLegs: 3,
      currentAgentId: agent._id,
      createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago -> triggers alert
    },

    // 2. Unbooked / Searching Partner (Fresh, 10 mins ago)
    {
      parcelId: 'LH-PKG-401002',
      parcelTrackingNumber: 'LH-TRK-401002',
      senderName: 'Pooja Jha',
      senderMobile: '9835067890',
      pickupLocation: 'Darbhanga Central',
      pickupAddress: 'Tower Chowk, Darbhanga',
      receiverName: 'Suman Devi',
      receiverMobile: '9835043210',
      deliveryLocation: 'Ladania Market',
      deliveryAddress: 'Near Block Office, Ladania',
      whatIsInside: 'Ayurvedic Medicines & Herb Concentrates',
      parcelCategory: 'Health & Wellness',
      weightKg: 1.5,
      dimensions: { lengthCm: 25, widthCm: 15, heightCm: 15 },
      approximateValue: 1450,
      customerOfferPrice: 160,
      preferredLogisticsType: 'Bike',
      status: 'SEARCHING_FOR_PARTNER',
      pickupCode: '8319',
      handoverCode: '2948',
      deliveryPin: '4291',
      currentLegIndex: 0,
      totalLegs: 3,
      currentAgentId: agent._id,
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
    },

    // 3. Partner Accepted
    {
      parcelId: 'LH-PKG-401003',
      parcelTrackingNumber: 'LH-TRK-401003',
      senderName: 'Anand Verma',
      senderMobile: '9811022334',
      pickupLocation: 'Varanasi Sigra',
      pickupAddress: 'Plot 88, Sigra Commercial Complex',
      receiverName: 'Devi Lal',
      receiverMobile: '9811099887',
      deliveryLocation: 'Ramnagar Mandi',
      deliveryAddress: 'Near Fort Gate, Ramnagar',
      whatIsInside: 'Textile Samples & Cotton Fabric Bundles',
      parcelCategory: 'Textiles & Apparel',
      weightKg: 5.0,
      dimensions: { lengthCm: 50, widthCm: 40, heightCm: 20 },
      approximateValue: 4500,
      customerOfferPrice: 280,
      preferredLogisticsType: 'Pickup Van',
      status: 'PARTNER_ACCEPTED',
      pickupCode: '4912',
      handoverCode: '9182',
      deliveryPin: '6019',
      currentLegIndex: 0,
      totalLegs: 3,
      currentPartnerId: partner._id,
      currentVehicleId: vehicle?._id,
      currentAgentId: agent._id,
      createdAt: new Date(Date.now() - 90 * 60 * 1000),
    },

    // 4. Pickup Pending (>2 hrs for alert)
    {
      parcelId: 'LH-PKG-401004',
      parcelTrackingNumber: 'LH-TRK-401004',
      senderName: 'Mithilesh Sahni',
      senderMobile: '9822011223',
      pickupLocation: 'Muzaffarpur Depot',
      pickupAddress: 'Sutapatti Mandi, Muzaffarpur',
      receiverName: 'Kailash Pandit',
      receiverMobile: '9822044556',
      deliveryLocation: 'Gajahra Village',
      deliveryAddress: 'Panchayat Bhavan Road, Gajahra',
      whatIsInside: 'Automobile Spare Parts & Bearings',
      parcelCategory: 'Hardware & Tools',
      weightKg: 8.5,
      dimensions: { lengthCm: 35, widthCm: 35, heightCm: 30 },
      approximateValue: 6800,
      customerOfferPrice: 420,
      preferredLogisticsType: 'Pickup Van',
      status: 'PICKUP_PENDING',
      pickupCode: '5820',
      handoverCode: '7162',
      deliveryPin: '8831',
      currentLegIndex: 0,
      totalLegs: 3,
      currentPartnerId: partner._id,
      currentVehicleId: vehicle?._id,
      currentAgentId: agent._id,
      createdAt: new Date(Date.now() - 3 * 3600 * 1000),
      updatedAt: new Date(Date.now() - 150 * 60 * 1000), // > 2 hrs
    },

    // 5. Picked Up
    {
      parcelId: 'LH-PKG-401005',
      parcelTrackingNumber: 'LH-TRK-401005',
      senderName: 'Gita Devi',
      senderMobile: '9877011223',
      pickupLocation: 'Madhubani Rural',
      pickupAddress: 'Near Kosi Canal, Rajnagar',
      receiverName: 'Babita Kumari',
      receiverMobile: '9877088990',
      deliveryLocation: 'Ladania Bazaar',
      deliveryAddress: 'Ward 2, Ladania',
      whatIsInside: 'Organic Honey & Ghee Jars',
      parcelCategory: 'Groceries & Staples',
      weightKg: 3.0,
      dimensions: { lengthCm: 30, widthCm: 25, heightCm: 20 },
      approximateValue: 2400,
      customerOfferPrice: 190,
      preferredLogisticsType: 'Bike',
      status: 'PICKED_UP',
      pickupCode: '9183',
      handoverCode: '3829',
      deliveryPin: '7192',
      currentLegIndex: 1,
      totalLegs: 3,
      currentPartnerId: partner._id,
      currentVehicleId: vehicle?._id,
      currentAgentId: agent._id,
      createdAt: new Date(Date.now() - 4 * 3600 * 1000),
    },

    // 6. In Transit (High Value > ₹5,000)
    {
      parcelId: 'LH-PKG-401006',
      parcelTrackingNumber: 'LH-TRK-401006',
      senderName: 'Sanjay Electronic World',
      senderMobile: '9833011223',
      pickupLocation: 'Patna Junction Road',
      pickupAddress: 'Bakarganj Electronics Mandi, Patna',
      receiverName: 'Vivek Sharma',
      receiverMobile: '9833055667',
      deliveryLocation: 'Gajahra Village',
      deliveryAddress: 'Near Middle School, Gajahra',
      whatIsInside: 'Solar Inverter Battery Unit & Cables',
      parcelCategory: 'Electronics & Appliances',
      weightKg: 14.0,
      dimensions: { lengthCm: 45, widthCm: 30, heightCm: 35 },
      approximateValue: 12500, // High Value Alert
      customerOfferPrice: 650,
      preferredLogisticsType: 'Pickup Van',
      status: 'IN_TRANSIT',
      pickupCode: '3192',
      handoverCode: '8291',
      deliveryPin: '9034',
      currentLegIndex: 1,
      totalLegs: 3,
      currentPartnerId: partner._id,
      currentVehicleId: vehicle?._id,
      currentAgentId: agent._id,
      createdAt: new Date(Date.now() - 5 * 3600 * 1000),
    },

    // 7. At Hub (Handover Pending)
    {
      parcelId: 'LH-PKG-401007',
      parcelTrackingNumber: 'LH-TRK-401007',
      senderName: 'Kisan Krishi Seva Kendra',
      senderMobile: '9855011223',
      pickupLocation: 'Darbhanga Mandi',
      pickupAddress: 'Bazar Samiti, Darbhanga',
      receiverName: 'Mukesh Kumar Jha',
      receiverMobile: '9855099887',
      deliveryLocation: 'Gajahra Hub',
      deliveryAddress: 'Village Gajahra, Ladania, Madhubani',
      whatIsInside: 'Hybrid Seeds & Organic Fertilizer Pack',
      parcelCategory: 'Agriculture & Farm Inputs',
      weightKg: 10.0,
      dimensions: { lengthCm: 50, widthCm: 35, heightCm: 25 },
      approximateValue: 3800,
      customerOfferPrice: 350,
      preferredLogisticsType: 'Pickup Van',
      status: 'HANDOVER_PENDING',
      pickupCode: '7291',
      handoverCode: '5829',
      deliveryPin: '3190',
      currentLegIndex: 1,
      totalLegs: 3,
      currentPartnerId: partner._id,
      currentVehicleId: vehicle?._id,
      currentAgentId: agent._id,
      createdAt: new Date(Date.now() - 7 * 3600 * 1000),
    },

    // 8. At Village Agent
    {
      parcelId: 'LH-PKG-401008',
      parcelTrackingNumber: 'LH-TRK-401008',
      senderName: 'Bihar Books Emporium',
      senderMobile: '9866011223',
      pickupLocation: 'Patna Ashok Rajpath',
      pickupAddress: 'Opp. Science College, Patna',
      receiverName: 'Amit Kumar',
      receiverMobile: '9866088990',
      deliveryLocation: 'Gajahra Village',
      deliveryAddress: 'Ward 3, Near Kali Mandir, Gajahra',
      whatIsInside: 'Competitive Exam Books & Study Materials',
      parcelCategory: 'Books & Stationery',
      weightKg: 4.5,
      dimensions: { lengthCm: 35, widthCm: 25, heightCm: 20 },
      approximateValue: 2200,
      customerOfferPrice: 240,
      preferredLogisticsType: 'Bike',
      status: 'RECEIVED_BY_AGENT',
      pickupCode: '6291',
      handoverCode: '4910',
      deliveryPin: '1182',
      currentLegIndex: 2,
      totalLegs: 3,
      currentPartnerId: partner._id,
      currentVehicleId: vehicle?._id,
      currentAgentId: agent._id,
      createdAt: new Date(Date.now() - 8 * 3600 * 1000),
    },

    // 9. Out for Delivery
    {
      parcelId: 'LH-PKG-401009',
      parcelTrackingNumber: 'LH-TRK-401009',
      senderName: 'Mithila Khadi Bhandar',
      senderMobile: '9877011998',
      pickupLocation: 'Madhubani Main Road',
      pickupAddress: 'Khadi Gramodyog Bhawan, Madhubani',
      receiverName: 'Geeta Devi',
      receiverMobile: '9877022334',
      deliveryLocation: 'Gajahra Village',
      deliveryAddress: 'Ward 5, Near Pond, Gajahra',
      whatIsInside: 'Khadi Kurta Sets & Woolen Shawl',
      parcelCategory: 'Textiles & Apparel',
      weightKg: 2.0,
      dimensions: { lengthCm: 35, widthCm: 25, heightCm: 15 },
      approximateValue: 2900,
      customerOfferPrice: 200,
      preferredLogisticsType: 'Bike',
      status: 'OUT_FOR_DELIVERY',
      pickupCode: '1829',
      handoverCode: '9301',
      deliveryPin: '4491',
      currentLegIndex: 2,
      totalLegs: 3,
      currentPartnerId: partner._id,
      currentVehicleId: vehicle?._id,
      currentAgentId: agent._id,
      createdAt: new Date(Date.now() - 10 * 3600 * 1000),
    },

    // 10. Delivered
    {
      parcelId: 'LH-PKG-401010',
      parcelTrackingNumber: 'LH-TRK-401010',
      senderName: 'Darbhanga Makhana Traders',
      senderMobile: '9888011223',
      pickupLocation: 'Darbhanga Hub',
      pickupAddress: 'Makhana Market, Darbhanga',
      receiverName: 'Sudhir Jha',
      receiverMobile: '9888099887',
      deliveryLocation: 'Gajahra Village',
      deliveryAddress: 'House 18, Gajahra, Ladania',
      whatIsInside: 'Grade-A Phool Makhana (5kg Bag)',
      parcelCategory: 'Groceries & Staples',
      weightKg: 5.2,
      dimensions: { lengthCm: 45, widthCm: 40, heightCm: 30 },
      approximateValue: 3500,
      customerOfferPrice: 310,
      preferredLogisticsType: 'Pickup Van',
      status: 'DELIVERED',
      pickupCode: '8392',
      handoverCode: '1029',
      deliveryPin: '9920',
      currentLegIndex: 2,
      totalLegs: 3,
      currentPartnerId: partner._id,
      currentVehicleId: vehicle?._id,
      currentAgentId: agent._id,
      createdAt: new Date(Date.now() - 24 * 3600 * 1000),
      updatedAt: new Date(Date.now() - 2 * 3600 * 1000),
    },

    // 11. Failed Delivery
    {
      parcelId: 'LH-PKG-401011',
      parcelTrackingNumber: 'LH-TRK-401011',
      senderName: 'Varanasi Silk Weaver Co-op',
      senderMobile: '9899011223',
      pickupLocation: 'Varanasi Chowk',
      pickupAddress: 'Kunj Gali, Varanasi',
      receiverName: 'Archana Devi',
      receiverMobile: '9899033445',
      deliveryLocation: 'Gajahra Village',
      deliveryAddress: 'Near Primary Health Center, Gajahra',
      whatIsInside: 'Banarasi Silk Bridal Saree with Box',
      parcelCategory: 'Textiles & Apparel',
      weightKg: 1.8,
      dimensions: { lengthCm: 35, widthCm: 30, heightCm: 10 },
      approximateValue: 8500,
      customerOfferPrice: 280,
      preferredLogisticsType: 'Bike',
      status: 'FAILED_DELIVERY',
      pickupCode: '4910',
      handoverCode: '5829',
      deliveryPin: '3318',
      currentLegIndex: 2,
      totalLegs: 3,
      currentPartnerId: partner._id,
      currentVehicleId: vehicle?._id,
      currentAgentId: agent._id,
      createdAt: new Date(Date.now() - 36 * 3600 * 1000),
    },

    // 12. Returned
    {
      parcelId: 'LH-PKG-401012',
      parcelTrackingNumber: 'LH-TRK-401012',
      senderName: 'Mithila Pottery Studio',
      senderMobile: '9800011223',
      pickupLocation: 'Jhajharpur Mandi',
      pickupAddress: 'Pottery Cluster, Jhajharpur',
      receiverName: 'Santosh Sah',
      receiverMobile: '9800044556',
      deliveryLocation: 'Ladania Market',
      deliveryAddress: 'Near Bus Stand, Ladania',
      whatIsInside: 'Terracotta Decorative Lamps (Diya Set)',
      parcelCategory: 'Art & Handicrafts',
      weightKg: 4.0,
      dimensions: { lengthCm: 40, widthCm: 30, heightCm: 25 },
      approximateValue: 1200,
      customerOfferPrice: 170,
      preferredLogisticsType: 'Bike',
      status: 'RETURNED',
      pickupCode: '9012',
      handoverCode: '4910',
      deliveryPin: '7721',
      currentLegIndex: 2,
      totalLegs: 3,
      currentPartnerId: partner._id,
      currentVehicleId: vehicle?._id,
      currentAgentId: agent._id,
      createdAt: new Date(Date.now() - 48 * 3600 * 1000),
    },

    // 13. Cancelled
    {
      parcelId: 'LH-PKG-401013',
      parcelTrackingNumber: 'LH-TRK-401013',
      senderName: 'Deepak Electronic Store',
      senderMobile: '9811099112',
      pickupLocation: 'Madhubani Station Road',
      pickupAddress: 'Shop 4, Station Road, Madhubani',
      receiverName: 'Mohan Kumar',
      receiverMobile: '9811088776',
      deliveryLocation: 'Gajahra Village',
      deliveryAddress: 'Ward 1, Gajahra',
      whatIsInside: 'LED Emergency Light & Solar Torch',
      parcelCategory: 'Electronics & Appliances',
      weightKg: 2.5,
      dimensions: { lengthCm: 30, widthCm: 20, heightCm: 15 },
      approximateValue: 1600,
      customerOfferPrice: 150,
      preferredLogisticsType: 'Bike',
      status: 'CANCELLED',
      pickupCode: '3910',
      handoverCode: '8192',
      deliveryPin: '5519',
      currentLegIndex: 0,
      totalLegs: 3,
      currentAgentId: agent._id,
      createdAt: new Date(Date.now() - 12 * 3600 * 1000),
    },

    // 14. Disputed (Customer Claims Damaged Item)
    {
      parcelId: 'LH-PKG-401014',
      parcelTrackingNumber: 'LH-TRK-401014',
      senderName: 'Kosi Glassware & Crockery',
      senderMobile: '9822099334',
      pickupLocation: 'Muzaffarpur Bazaar',
      pickupAddress: 'Crockery Market, Muzaffarpur',
      receiverName: 'Prem Prakash Jha',
      receiverMobile: '9822077665',
      deliveryLocation: 'Gajahra Village',
      deliveryAddress: 'House 31, Gajahra, Ladania',
      whatIsInside: 'Ceramic Dinner Set & Tea Cups',
      parcelCategory: 'Home & Kitchen',
      weightKg: 6.5,
      dimensions: { lengthCm: 45, widthCm: 35, heightCm: 30 },
      approximateValue: 4200,
      customerOfferPrice: 320,
      preferredLogisticsType: 'Pickup Van',
      status: 'IN_TRANSIT',
      pickupCode: '6192',
      handoverCode: '2910',
      deliveryPin: '8821',
      currentLegIndex: 1,
      totalLegs: 3,
      currentPartnerId: partner._id,
      currentVehicleId: vehicle?._id,
      currentAgentId: agent._id,
      createdAt: new Date(Date.now() - 18 * 3600 * 1000),
    },

    // 15. User Tracked Consignment LH-TRK-810263
    {
      parcelId: 'LH-PKG-810263',
      parcelTrackingNumber: 'LH-TRK-810263',
      senderName: 'Sonapur Handlooms',
      senderMobile: '9999900005',
      pickupLocation: 'Sonapur',
      pickupAddress: 'Near Station Road, Darbhanga',
      receiverName: 'Rameshwar Bahera',
      receiverMobile: '9876543210',
      deliveryLocation: 'Ramnagar',
      deliveryAddress: 'House 14, Main Chowk, Village Bahera',
      whatIsInside: 'Handwoven Shawls & Cotton Fabric',
      parcelCategory: 'Clothes',
      weightKg: 3.0,
      dimensions: { lengthCm: 35, widthCm: 25, heightCm: 15 },
      approximateValue: 850,
      customerOfferPrice: 200,
      preferredLogisticsType: 'Bike',
      status: 'DELIVERED',
      pickupCode: '9748',
      handoverCode: '6481',
      deliveryPin: '1312',
      currentLegIndex: 3,
      totalLegs: 3,
      currentPartnerId: partner._id,
      currentVehicleId: vehicle?._id,
      currentAgentId: agent._id,
      paymentMethod: 'CASH_TO_PARTNER',
      paymentStatus: 'PAID',
      createdAt: new Date(Date.now() - 2 * 3600 * 1000),
    },
  ];

  for (const item of operationalParcelsData) {
    const existing = await Parcel.findOne({
      $or: [{ parcelId: item.parcelId }, { parcelTrackingNumber: item.parcelTrackingNumber }],
    });
    if (existing) {
      continue;
    }

    const parcel = await Parcel.create({
      ...item,
      senderLocation: {
        addressLine: item.pickupAddress,
        villageOrCity: item.pickupLocation,
        district: 'Madhubani / Darbhanga',
        state: 'Bihar',
        pincode: '847226',
      },
      destinationLocation: {
        addressLine: item.deliveryAddress,
        villageOrCity: item.deliveryLocation,
        district: 'Madhubani',
        state: 'Bihar',
        pincode: '847232',
      },
    });

    const pAny = parcel as any;
    const partnerUserAny = (partner.userId as any)?._id || (partner.userId as any);
    const agentUserAny = (agent.userId as any)?._id || (agent.userId as any);

    // Create Initial Tracking Event
    await ParcelEvent.create({
      parcelId: parcel._id,
      parcelTrackingNumber: parcel.parcelTrackingNumber,
      eventType: 'CREATED',
      locationName: parcel.pickupLocation,
      description: `Parcel ${parcel.parcelId} registered by sender (${parcel.senderName}). Contents: ${parcel.whatIsInside}. Customer offer: ₹${parcel.customerOfferPrice}`,
      actorRole: 'Sender / Customer',
      actorId: customerUser?._id,
      timestamp: pAny.createdAt,
    });

    // Create 3 ShipmentLeg records
    const leg1 = await ShipmentLeg.create({
      parcelId: parcel._id,
      sequence: 1,
      legType: 'FIRST_MILE_PICKUP',
      originLocation: parcel.senderLocation,
      destinationLocation: {
        addressLine: `${parcel.pickupLocation} Transit Point`,
        villageOrCity: parcel.pickupLocation,
        district: 'Madhubani',
        state: 'Bihar',
        pincode: '847226',
      },
      assignedType: 'PARTNER',
      assignedToUserId: partnerUserAny,
      pickupVerificationCode: parcel.pickupCode,
      handoverVerificationCode: parcel.handoverCode,
      status: ['PICKED_UP', 'IN_TRANSIT', 'HANDOVER_PENDING', 'RECEIVED_BY_AGENT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(parcel.status)
        ? 'completed'
        : parcel.status === 'PARTNER_ACCEPTED' || parcel.status === 'PICKUP_PENDING'
        ? 'in_progress'
        : 'pending',
      distanceKm: 8,
      estimatedEarnings: Math.round(parcel.customerOfferPrice * 0.4),
    });

    const leg2 = await ShipmentLeg.create({
      parcelId: parcel._id,
      sequence: 2,
      legType: 'MID_MILE_HAUL',
      originLocation: leg1.destinationLocation,
      destinationLocation: {
        addressLine: `${parcel.deliveryLocation} Village Hub`,
        villageOrCity: parcel.deliveryLocation,
        district: 'Madhubani',
        state: 'Bihar',
        pincode: '847232',
      },
      assignedType: 'PARTNER',
      assignedToUserId: partnerUserAny,
      pickupVerificationCode: parcel.pickupCode,
      handoverVerificationCode: parcel.handoverCode,
      status: ['RECEIVED_BY_AGENT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(parcel.status)
        ? 'completed'
        : ['IN_TRANSIT', 'HANDOVER_PENDING'].includes(parcel.status)
        ? 'in_progress'
        : 'pending',
      distanceKm: 28,
      estimatedEarnings: Math.round(parcel.customerOfferPrice * 0.45),
    });

    await ShipmentLeg.create({
      parcelId: parcel._id,
      sequence: 3,
      legType: 'LAST_MILE_VILLAGE_DELIVERY',
      originLocation: leg2.destinationLocation,
      destinationLocation: parcel.destinationLocation,
      assignedType: 'AGENT',
      assignedToUserId: agentUserAny,
      pickupVerificationCode: parcel.handoverCode,
      handoverVerificationCode: parcel.deliveryPin,
      status: parcel.status === 'DELIVERED'
        ? 'completed'
        : ['RECEIVED_BY_AGENT', 'OUT_FOR_DELIVERY'].includes(parcel.status)
        ? 'in_progress'
        : 'pending',
      distanceKm: 4,
      estimatedEarnings: Math.max(30, Math.round(parcel.customerOfferPrice * 0.15)),
    });

    // Create intermediate events based on status
    if (['PICKED_UP', 'IN_TRANSIT', 'HANDOVER_PENDING', 'RECEIVED_BY_AGENT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(parcel.status)) {
      await ParcelEvent.create({
        parcelId: parcel._id,
        parcelTrackingNumber: parcel.parcelTrackingNumber,
        eventType: 'PICKED_UP',
        locationName: parcel.pickupLocation,
        description: `Pickup verified by partner (${partner.businessName}). Parcel en-route.`,
        actorRole: 'Logistics Partner',
        actorId: partnerUserAny,
        timestamp: new Date(new Date(pAny.createdAt).getTime() + 45 * 60 * 1000),
      });
    }

    if (['HANDOVER_PENDING', 'RECEIVED_BY_AGENT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(parcel.status)) {
      await ParcelEvent.create({
        parcelId: parcel._id,
        parcelTrackingNumber: parcel.parcelTrackingNumber,
        eventType: 'ARRIVED_AT_VILLAGE_HUB',
        locationName: agent.villageName,
        description: `Parcel reached Village Agent Hub (${agent.villageName}). Handover verified.`,
        actorRole: 'Village Agent',
        actorId: agentUserAny,
        timestamp: new Date(new Date(pAny.createdAt).getTime() + 180 * 60 * 1000),
      });
    }

    if (parcel.status === 'OUT_FOR_DELIVERY') {
      await ParcelEvent.create({
        parcelId: parcel._id,
        parcelTrackingNumber: parcel.parcelTrackingNumber,
        eventType: 'OUT_FOR_DELIVERY',
        locationName: agent.villageName,
        description: `Village Agent Manohar Jha is out for doorstep delivery.`,
        actorRole: 'Village Agent',
        actorId: agentUserAny,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
      });
    }

    if (parcel.status === 'DELIVERED') {
      await ParcelEvent.create({
        parcelId: parcel._id,
        parcelTrackingNumber: parcel.parcelTrackingNumber,
        eventType: 'DELIVERED',
        locationName: parcel.deliveryLocation,
        description: `Delivered successfully to receiver (${parcel.receiverName}). PIN verified.`,
        actorRole: 'Village Agent',
        actorId: agentUserAny,
        timestamp: pAny.updatedAt,
      });

      // Credit Earnings for partner and agent
      await Earning.create([
        {
          actorType: 'PARTNER',
          actorId: partnerUserAny,
          referenceType: 'PARCEL',
          referenceId: parcel.parcelId,
          baseAmount: 40,
          bonus: 140,
          deduction: 0,
          netAmount: 180,
          status: 'paid',
          remarks: `Delivery payout for haul ${parcel.parcelId}`,
        },
        {
          actorType: 'AGENT',
          actorId: agentUserAny,
          referenceType: 'PARCEL',
          referenceId: parcel.parcelId,
          baseAmount: 30,
          bonus: 15,
          deduction: 0,
          netAmount: 45,
          status: 'available',
          remarks: `Village doorstep delivery commission for ${parcel.parcelId}`,
        },
      ]);
    }

    if (parcel.status === 'FAILED_DELIVERY') {
      await ParcelEvent.create({
        parcelId: parcel._id,
        parcelTrackingNumber: parcel.parcelTrackingNumber,
        eventType: 'EXCEPTION',
        locationName: parcel.deliveryLocation,
        description: `Delivery attempt failed: Receiver unavailable at residence. Reattempt scheduled for tomorrow.`,
        actorRole: 'Village Agent',
        actorId: agentUserAny,
      });
    }

    if (parcel.status === 'RETURNED') {
      await ParcelEvent.create({
        parcelId: parcel._id,
        parcelTrackingNumber: parcel.parcelTrackingNumber,
        eventType: 'EXCEPTION',
        locationName: parcel.deliveryLocation,
        description: `Customer refused delivery. Return initiated to sender at Jhajharpur.`,
        actorRole: 'Platform Admin',
        actorId: adminUser?._id,
      });
    }

    // Attach dispute for parcel 14
    if (parcel.parcelId === 'LH-PKG-401014') {
      await ParcelDispute.create({
        parcelId: parcel._id,
        disputeNumber: 'LH-DSP-904112',
        raisedByRole: 'CUSTOMER',
        raisedByUserId: customerUser?._id,
        reason: 'DAMAGED_ITEM',
        description: 'Customer claims ceramic dinner set had cracked plates upon mid-transit inspection.',
        status: 'OPEN',
        claimAmount: 4200,
        refundApprovedAmount: 0,
      });
    }

    // Initial Audit Log
    await AdminAuditLog.create({
      adminId: (adminUser as any)?._id || partnerUserAny,
      adminName: 'Platform Operations Engine',
      action: 'SYSTEM_PARCEL_INGESTION',
      targetType: 'PARCEL',
      targetId: parcel._id.toString(),
      reason: 'Parcel ingested into LocalHaat logistics corridor',
      details: {
        category: parcel.parcelCategory,
        weightKg: parcel.weightKg,
        customerOffer: parcel.customerOfferPrice,
      },
    });
  }

  console.log(`[SeedParcels] Successfully seeded ${operationalParcelsData.length} operational parcels!`);
};

if (process.argv[1]?.includes('seedOperationalParcels')) {
  seedOperationalParcels()
    .then(() => disconnectDB())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
