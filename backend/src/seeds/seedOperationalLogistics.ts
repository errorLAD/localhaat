import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import {
  LogisticsPartner,
  Vehicle,
  PartnerRoute,
  LogisticsTrip,
  LogisticsComplaint,
  LogisticsActivity,
  Parcel,
  User,
  VillageAgent,
  Earning,
  Payout,
} from '../models/index.js';

export const seedOperationalLogistics = async () => {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  console.log('[SeedLogistics] Checking and seeding operational logistics partners & trips...');

  // Ensure customer and admin users exist
  const adminUser = (await User.findOne({ role: 'admin' })) || (await User.findOne());
  const customerUser = (await User.findOne({ role: 'customer' })) || (await User.findOne());

  // 1. Create or Find Partner 1: Ramesh Kumar (Professional Partner - Bike)
  let rameshUser = await User.findOne({ phone: '9835011001' });
  if (!rameshUser) {
    rameshUser = await User.create({
      name: 'Ramesh Kumar',
      phone: '9835011001',
      email: 'ramesh.logistics@localhaat.in',
      role: 'logistics_partner',
      isActive: true,
      kycStatus: 'verified',
      defaultLocation: {
        addressLine: 'Station Road, Near Bus Stand',
        villageOrCity: 'Darbhanga',
        district: 'Darbhanga',
        state: 'Bihar',
        pincode: '846004',
      },
    });
  }

  let rameshPartner = await LogisticsPartner.findOne({ userId: rameshUser._id });
  if (!rameshPartner) {
    rameshPartner = await LogisticsPartner.create({
      userId: rameshUser._id,
      partnerCode: 'LP-3001',
      businessName: 'Ramesh Rural Express',
      partnerType: 'transporter',
      partnerCategory: 'PROFESSIONAL',
      partnerStatus: 'MOVING',
      verificationStatus: 'VERIFIED',
      phone: '9835011001',
      email: 'ramesh.logistics@localhaat.in',
      primaryTransportType: 'Bike',
      vehicleNumber: 'BR-07-AB-4021',
      capacityKg: 10,
      serviceAreas: ['Darbhanga', 'Benipur', 'Bahera', 'Madhubani Corridor'],
      rating: 4.92,
      totalTrips: 184,
      totalParcelsDelivered: 412,
      activeParcelsCount: 3,
      isActive: true,
      isOnline: true,
      isVerified: true,
      currentLocation: {
        latitude: 26.1542,
        longitude: 85.8918,
        locationName: 'Benipur Junction',
        lastUpdated: new Date(),
      },
      commissionRatePerKm: 10,
      baseDeliveryFee: 35,
      totalEarnings: 14250,
      walletBalance: 2850,
      bankDetails: {
        accountHolderName: 'Ramesh Kumar',
        accountNumber: '381920194812',
        ifscCode: 'SBIN0001284',
        bankName: 'State Bank of India Darbhanga',
        upiId: 'ramesh.kumar@okhdfcbank',
      },
      documents: [
        {
          docType: 'DRIVING_LICENSE',
          documentNumber: 'DL-BR07-2018-9128',
          fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
          status: 'VERIFIED',
          verifiedAt: new Date(Date.now() - 30 * 86400000),
        },
        {
          docType: 'RC_BOOK',
          documentNumber: 'RC-BR07AB4021',
          fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
          status: 'VERIFIED',
          verifiedAt: new Date(Date.now() - 30 * 86400000),
        },
      ],
    });
  }

  // Ramesh Vehicle
  let rameshVehicle = await Vehicle.findOne({ partnerId: rameshPartner._id });
  if (!rameshVehicle) {
    rameshVehicle = await Vehicle.create({
      partnerId: rameshPartner._id,
      vehicleType: 'Bike',
      registrationNumber: 'BR-07-AB-4021',
      modelName: 'Hero Splendor Plus (Carrier Fitted)',
      maxCapacityKg: 10,
      currentStatus: 'in_transit',
      currentCoordinates: {
        latitude: 26.1542,
        longitude: 85.8918,
        lastUpdated: new Date(),
      },
    });
    rameshPartner.vehicleIds = [rameshVehicle._id as any];
    await rameshPartner.save();
  }

  // Ramesh Route
  let rameshRoute = await PartnerRoute.findOne({ partnerId: rameshPartner._id });
  if (!rameshRoute) {
    rameshRoute = await PartnerRoute.create({
      partnerId: rameshPartner._id,
      routeTitle: 'Darbhanga -> Benipur -> Village X Express Haul',
      sourceLocation: {
        addressLine: 'Station Road Depot',
        villageOrCity: 'Darbhanga',
        district: 'Darbhanga',
        state: 'Bihar',
        pincode: '846004',
      },
      destinationLocation: {
        addressLine: 'Panchayat Bhawan',
        villageOrCity: 'Village Gajahra',
        district: 'Madhubani',
        state: 'Bihar',
        pincode: '847232',
      },
      waypoints: [
        {
          addressLine: 'Benipur Chowk',
          villageOrCity: 'Benipur',
          district: 'Darbhanga',
          state: 'Bihar',
          pincode: '847103',
        },
        {
          addressLine: 'Bahera Market',
          villageOrCity: 'Bahera',
          district: 'Darbhanga',
          state: 'Bihar',
          pincode: '847201',
        },
      ],
      departureTime: '02:10 PM',
      travelDate: 'Today',
      vehicleType: 'Bike',
      capacityKg: 10,
      availableCapacityKg: 3,
      pricePerKg: 12,
      status: 'active',
    });
  }

  // 2. Create Partner 2: Suresh Kumar (Professional Partner - Auto / E-Rickshaw)
  let sureshUser = await User.findOne({ phone: '9835011002' });
  if (!sureshUser) {
    sureshUser = await User.create({
      name: 'Suresh Kumar',
      phone: '9835011002',
      email: 'suresh.transport@localhaat.in',
      role: 'logistics_partner',
      isActive: true,
      kycStatus: 'verified',
      defaultLocation: {
        addressLine: 'Laheriasarai Chowk',
        villageOrCity: 'Darbhanga',
        district: 'Darbhanga',
        state: 'Bihar',
        pincode: '846001',
      },
    });
  }

  let sureshPartner = await LogisticsPartner.findOne({ userId: sureshUser._id });
  if (!sureshPartner) {
    sureshPartner = await LogisticsPartner.create({
      userId: sureshUser._id,
      partnerCode: 'LP-3002',
      businessName: 'Mithila Auto Logistics',
      partnerType: 'transporter',
      partnerCategory: 'PROFESSIONAL',
      partnerStatus: 'MOVING',
      verificationStatus: 'VERIFIED',
      phone: '9835011002',
      email: 'suresh.transport@localhaat.in',
      primaryTransportType: 'Auto',
      vehicleNumber: 'BR-07-PA-7822',
      capacityKg: 40,
      serviceAreas: ['Darbhanga', 'Bahadurpur', 'Pandaul', 'Village Y'],
      rating: 4.88,
      totalTrips: 96,
      totalParcelsDelivered: 284,
      activeParcelsCount: 6,
      isActive: true,
      isOnline: true,
      isVerified: true,
      currentLocation: {
        latitude: 26.112,
        longitude: 85.934,
        locationName: 'Bahadurpur Main Road',
        lastUpdated: new Date(),
      },
      commissionRatePerKm: 14,
      baseDeliveryFee: 50,
      totalEarnings: 21800,
      walletBalance: 4200,
      bankDetails: {
        accountHolderName: 'Suresh Kumar',
        accountNumber: '492019482710',
        ifscCode: 'PUNB0182700',
        bankName: 'Punjab National Bank Darbhanga',
        upiId: 'suresh.mithila@okaxis',
      },
      documents: [
        {
          docType: 'DRIVING_LICENSE',
          documentNumber: 'DL-BR07-2016-1029',
          fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
          status: 'VERIFIED',
          verifiedAt: new Date(Date.now() - 60 * 86400000),
        },
      ],
    });
  }

  let sureshVehicle = await Vehicle.findOne({ partnerId: sureshPartner._id });
  if (!sureshVehicle) {
    sureshVehicle = await Vehicle.create({
      partnerId: sureshPartner._id,
      vehicleType: 'Auto',
      registrationNumber: 'BR-07-PA-7822',
      modelName: 'Bajaj Maxima Z Cargo Auto',
      maxCapacityKg: 40,
      currentStatus: 'in_transit',
      currentCoordinates: {
        latitude: 26.112,
        longitude: 85.934,
        lastUpdated: new Date(),
      },
    });
    sureshPartner.vehicleIds = [sureshVehicle._id as any];
    await sureshPartner.save();
  }

  // 3. Create Partner 3: Amit Kumar (Travelling Partner - Bike)
  let amitUser = await User.findOne({ phone: '9835011003' });
  if (!amitUser) {
    amitUser = await User.create({
      name: 'Amit Kumar',
      phone: '9835011003',
      email: 'amit.traveller@gmail.com',
      role: 'logistics_partner',
      isActive: true,
      kycStatus: 'verified',
      defaultLocation: {
        addressLine: 'Donar Chowk',
        villageOrCity: 'Darbhanga',
        district: 'Darbhanga',
        state: 'Bihar',
        pincode: '846004',
      },
    });
  }

  let amitPartner = await LogisticsPartner.findOne({ userId: amitUser._id });
  if (!amitPartner) {
    amitPartner = await LogisticsPartner.create({
      userId: amitUser._id,
      partnerCode: 'LP-3003',
      businessName: 'Amit Kumar (Daily Commuter)',
      partnerType: 'individual',
      partnerCategory: 'TRAVELLING',
      partnerStatus: 'AVAILABLE',
      verificationStatus: 'VERIFIED',
      phone: '9835011003',
      email: 'amit.traveller@gmail.com',
      primaryTransportType: 'Bike',
      vehicleNumber: 'BR-07-BQ-1029',
      capacityKg: 5,
      serviceAreas: ['Darbhanga', 'Benipur'],
      rating: 4.95,
      totalTrips: 24,
      totalParcelsDelivered: 31,
      activeParcelsCount: 0,
      isActive: true,
      isOnline: true,
      isVerified: true,
      currentLocation: {
        latitude: 26.15,
        longitude: 85.89,
        locationName: 'Darbhanga Donar Chowk',
        lastUpdated: new Date(),
      },
      commissionRatePerKm: 8,
      baseDeliveryFee: 30,
      totalEarnings: 3150,
      walletBalance: 750,
      documents: [
        {
          docType: 'AADHAR_CARD',
          documentNumber: 'XXXX-XXXX-8921',
          fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
          status: 'VERIFIED',
          verifiedAt: new Date(Date.now() - 15 * 86400000),
        },
      ],
    });
  }

  // 4. Create Partner 4: Approved Public Transport (Bus Fleet / Regional Hauler)
  let transportUser = await User.findOne({ phone: '9835011004' });
  if (!transportUser) {
    transportUser = await User.create({
      name: 'Mithila Rajya Parivahan Partner',
      phone: '9835011004',
      email: 'mithila.bus@localhaat.in',
      role: 'logistics_partner',
      isActive: true,
      kycStatus: 'verified',
      defaultLocation: {
        addressLine: 'Mithila Transport Nagar, Patna Bypass',
        villageOrCity: 'Patna',
        district: 'Patna',
        state: 'Bihar',
        pincode: '800020',
      },
    });
  }

  let transportPartner = await LogisticsPartner.findOne({ userId: transportUser._id });
  if (!transportPartner) {
    transportPartner = await LogisticsPartner.create({
      userId: transportUser._id,
      partnerCode: 'LP-3004',
      businessName: 'Approved Regional Transport Service',
      partnerType: 'fleet_owner',
      partnerCategory: 'PROFESSIONAL',
      partnerStatus: 'MOVING',
      verificationStatus: 'VERIFIED',
      phone: '9835011004',
      email: 'mithila.bus@localhaat.in',
      primaryTransportType: 'Bus',
      vehicleNumber: 'BR-01-PA-9182',
      capacityKg: 100,
      serviceAreas: ['Patna', 'Muzaffarpur', 'Samastipur', 'Darbhanga', 'Madhubani'],
      rating: 4.8,
      totalTrips: 340,
      totalParcelsDelivered: 1820,
      activeParcelsCount: 18,
      isActive: true,
      isOnline: true,
      isVerified: true,
      currentLocation: {
        latitude: 25.98,
        longitude: 85.54,
        locationName: 'Samastipur Highway Transit Point',
        lastUpdated: new Date(),
      },
      commissionRatePerKm: 6,
      baseDeliveryFee: 60,
      totalEarnings: 68400,
      walletBalance: 12500,
      documents: [
        {
          docType: 'COMMERCIAL_PERMIT',
          documentNumber: 'PERMIT-BR-2022-819',
          fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
          status: 'VERIFIED',
          verifiedAt: new Date(Date.now() - 90 * 86400000),
        },
      ],
    });
  }

  // 5. Create Partner 5: Pending Verification (Vijay Yadav - Van / Pickup)
  let vijayUser = await User.findOne({ phone: '9835011005' });
  if (!vijayUser) {
    vijayUser = await User.create({
      name: 'Vijay Yadav',
      phone: '9835011005',
      email: 'vijay.yadav@gmail.com',
      role: 'logistics_partner',
      isActive: true,
      kycStatus: 'pending',
      defaultLocation: {
        addressLine: 'Pandaul Market',
        villageOrCity: 'Pandaul',
        district: 'Madhubani',
        state: 'Bihar',
        pincode: '847234',
      },
    });
  }

  let vijayPartner = await LogisticsPartner.findOne({ userId: vijayUser._id });
  if (!vijayPartner) {
    vijayPartner = await LogisticsPartner.create({
      userId: vijayUser._id,
      partnerCode: 'LP-3005',
      businessName: 'Vijay Cargo Express',
      partnerType: 'transporter',
      partnerCategory: 'PROFESSIONAL',
      partnerStatus: 'OFFLINE',
      verificationStatus: 'PENDING',
      phone: '9835011005',
      email: 'vijay.yadav@gmail.com',
      primaryTransportType: 'Van',
      vehicleNumber: 'BR-32-T-5512',
      capacityKg: 350,
      serviceAreas: ['Madhubani', 'Pandaul', 'Sakri'],
      rating: 5.0,
      totalTrips: 0,
      totalParcelsDelivered: 0,
      activeParcelsCount: 0,
      isActive: true,
      isOnline: false,
      isVerified: false,
      currentLocation: {
        latitude: 26.24,
        longitude: 86.08,
        locationName: 'Pandaul Garage',
        lastUpdated: new Date(),
      },
      documents: [
        {
          docType: 'DRIVING_LICENSE',
          documentNumber: 'DL-BR32-2021-4821',
          fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
          status: 'PENDING',
        },
        {
          docType: 'VEHICLE_INSURANCE',
          documentNumber: 'INS-2026-9182',
          fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
          status: 'PENDING',
        },
      ],
    });
  }

  // 6. Connect Real Moving Parcels from MongoDB
  const movingParcels = await Parcel.find({
    status: { $in: ['IN_TRANSIT', 'PICKED_UP', 'PARTNER_ACCEPTED'] },
  }).limit(5);

  const parcelIdsRamesh = movingParcels.slice(0, 3).map((p) => p._id);
  const parcelIdsSuresh = movingParcels.slice(3, 5).map((p) => p._id);

  // Mark currentPartnerId on the parcels
  if (parcelIdsRamesh.length > 0) {
    await Parcel.updateMany(
      { _id: { $in: parcelIdsRamesh } },
      { currentPartnerId: rameshPartner._id, currentVehicleId: rameshVehicle?._id }
    );
  }

  // 7. Create LIVE TRIP 1: Ramesh Kumar (TRIP-302, Moving: Darbhanga -> Benipur -> Village X)
  const existingTrip1 = await LogisticsTrip.findOne({ tripId: 'TRIP-302' });
  if (!existingTrip1) {
    await LogisticsTrip.create({
      tripId: 'TRIP-302',
      partnerId: rameshPartner._id,
      partnerName: 'Ramesh Kumar',
      partnerMobile: '9835011001',
      partnerType: 'PROFESSIONAL',
      transportType: 'Bike',
      vehicleId: rameshVehicle?._id,
      vehicleType: 'Bike',
      vehicleNumber: 'BR-07-AB-4021',
      routeId: rameshRoute?._id,
      routeTitle: 'Darbhanga -> Benipur -> Village X Corridor',
      fromLocation: {
        villageOrCity: 'Darbhanga',
        district: 'Darbhanga',
        addressLine: 'Central Haat Depot, Darbhanga',
      },
      toLocation: {
        villageOrCity: 'Village Gajahra',
        district: 'Madhubani',
        addressLine: 'Panchayat Bhawan, Gajahra',
      },
      waypoints: [
        { villageOrCity: 'Benipur', district: 'Darbhanga', order: 1, status: 'REACHED', reachedAt: new Date(Date.now() - 35 * 60 * 1000) },
        { villageOrCity: 'Bahadurpur', district: 'Darbhanga', order: 2, status: 'PENDING' },
        { villageOrCity: 'Village X', district: 'Madhubani', order: 3, status: 'PENDING' },
      ],
      departureTime: '02:10 PM',
      expectedArrival: '04:15 PM',
      actualDeparture: new Date(Date.now() - 50 * 60 * 1000),
      tripStatus: 'MOVING',
      totalCapacityKg: 10,
      usedCapacityKg: 7,
      availableCapacityKg: 3,
      parcelIds: parcelIdsRamesh,
      activeParcelCount: parcelIdsRamesh.length || 3,
      currentOperationalLocation: 'Benipur',
      gpsCoordinates: {
        latitude: 26.1542,
        longitude: 85.8918,
        lastUpdated: new Date(),
      },
      routeProgress: 65,
      estimatedEarnings: 380,
      notes: 'Carrying urgent handicrafts and medicines. On schedule.',
    });
  }

  // 8. Create LIVE TRIP 2: Suresh Kumar (TRIP-305, Moving: Darbhanga -> Bahadurpur -> Village Y)
  const existingTrip2 = await LogisticsTrip.findOne({ tripId: 'TRIP-305' });
  if (!existingTrip2) {
    await LogisticsTrip.create({
      tripId: 'TRIP-305',
      partnerId: sureshPartner._id,
      partnerName: 'Suresh Kumar',
      partnerMobile: '9835011002',
      partnerType: 'PROFESSIONAL',
      transportType: 'Auto',
      vehicleId: sureshVehicle?._id,
      vehicleType: 'Auto',
      vehicleNumber: 'BR-07-PA-7822',
      routeTitle: 'Darbhanga -> Bahadurpur -> Village Y Cargo Run',
      fromLocation: {
        villageOrCity: 'Darbhanga',
        district: 'Darbhanga',
        addressLine: 'Laheriasarai Hub',
      },
      toLocation: {
        villageOrCity: 'Village Y (Pandaul)',
        district: 'Madhubani',
        addressLine: 'Village Y Drop Point',
      },
      waypoints: [
        { villageOrCity: 'Bahadurpur', district: 'Darbhanga', order: 1, status: 'REACHED' },
        { villageOrCity: 'Sakri Chowk', district: 'Madhubani', order: 2, status: 'PENDING' },
      ],
      departureTime: '01:45 PM',
      expectedArrival: '04:45 PM',
      actualDeparture: new Date(Date.now() - 75 * 60 * 1000),
      tripStatus: 'MOVING',
      totalCapacityKg: 40,
      usedCapacityKg: 24,
      availableCapacityKg: 16,
      parcelIds: parcelIdsSuresh,
      activeParcelCount: parcelIdsSuresh.length || 6,
      currentOperationalLocation: 'Bahadurpur',
      gpsCoordinates: {
        latitude: 26.112,
        longitude: 85.934,
        lastUpdated: new Date(),
      },
      routeProgress: 50,
      estimatedEarnings: 620,
      notes: 'Bulk rural agro deliveries across 4 panchayat drop points.',
    });
  }

  // 9. Create LIVE TRIP 3: Approved Public Transport (TRIP-310, Moving: Patna -> Darbhanga)
  const existingTrip3 = await LogisticsTrip.findOne({ tripId: 'TRIP-310' });
  if (!existingTrip3) {
    await LogisticsTrip.create({
      tripId: 'TRIP-310',
      partnerId: transportPartner._id,
      partnerName: 'Approved Transport Partner',
      partnerMobile: '9835011004',
      partnerType: 'PROFESSIONAL',
      transportType: 'Bus',
      vehicleType: 'Approved Public Transport Bus',
      vehicleNumber: 'BR-01-PA-9182',
      routeTitle: 'Patna -> Samastipur -> Darbhanga Intercity Trunk Line',
      fromLocation: {
        villageOrCity: 'Patna',
        district: 'Patna',
        addressLine: 'Mithapur ISBT Cargo Bay',
      },
      toLocation: {
        villageOrCity: 'Darbhanga',
        district: 'Darbhanga',
        addressLine: 'Darbhanga Central Hub',
      },
      waypoints: [
        { villageOrCity: 'Hajipur', district: 'Vaishali', order: 1, status: 'REACHED' },
        { villageOrCity: 'Samastipur', district: 'Samastipur', order: 2, status: 'REACHED' },
        { villageOrCity: 'Darbhanga', district: 'Darbhanga', order: 3, status: 'PENDING' },
      ],
      departureTime: '11:00 AM',
      expectedArrival: '05:00 PM',
      actualDeparture: new Date(Date.now() - 190 * 60 * 1000),
      tripStatus: 'MOVING',
      totalCapacityKg: 100,
      usedCapacityKg: 42,
      availableCapacityKg: 58,
      parcelIds: [],
      activeParcelCount: 18,
      currentOperationalLocation: 'Samastipur Bypass',
      gpsCoordinates: {
        latitude: 25.86,
        longitude: 85.78,
        lastUpdated: new Date(),
      },
      routeProgress: 75,
      estimatedEarnings: 1850,
      notes: 'Scheduled inter-district transport trunk haul.',
    });
  }

  // 10. Create TRIP 4: Amit Kumar (Travelling Partner, Scheduled Today)
  const existingTrip4 = await LogisticsTrip.findOne({ tripId: 'TRIP-315' });
  if (!existingTrip4) {
    await LogisticsTrip.create({
      tripId: 'TRIP-315',
      partnerId: amitPartner._id,
      partnerName: 'Amit Kumar',
      partnerMobile: '9835011003',
      partnerType: 'TRAVELLING',
      transportType: 'Bike',
      vehicleType: 'Bike',
      vehicleNumber: 'BR-07-BQ-1029',
      routeTitle: 'Darbhanga -> Benipur Commute',
      fromLocation: {
        villageOrCity: 'Darbhanga',
        district: 'Darbhanga',
        addressLine: 'Donar Chowk',
      },
      toLocation: {
        villageOrCity: 'Benipur',
        district: 'Darbhanga',
        addressLine: 'Near College Gate, Benipur',
      },
      waypoints: [{ villageOrCity: 'Bahera', district: 'Darbhanga', order: 1, status: 'PENDING' }],
      departureTime: '02:00 PM',
      expectedArrival: '03:30 PM',
      tripStatus: 'READY',
      totalCapacityKg: 5,
      usedCapacityKg: 0,
      availableCapacityKg: 5,
      parcelIds: [],
      activeParcelCount: 0,
      currentOperationalLocation: 'Darbhanga Donar',
      routeProgress: 0,
      estimatedEarnings: 120,
      notes: 'Travelling partner ready to carry small parcel on regular commute.',
    });
  }

  // 11. Create a Realistic Complaint
  const existingComplaint = await LogisticsComplaint.findOne({ complaintId: 'LC-9021' });
  if (!existingComplaint) {
    await LogisticsComplaint.create({
      complaintId: 'LC-9021',
      partnerId: rameshPartner._id,
      customerName: 'Santosh Kumar',
      customerPhone: '9835099881',
      category: 'LATE_PICKUP',
      description: 'Pickup was scheduled for 1:30 PM, partner arrived at 2:05 PM due to rain.',
      status: 'RESOLVED',
      adminNotes: 'Partner notified customer of heavy rain delay. Delivery still made on time.',
      resolution: 'Verified with GPS timestamp. Partner issued reminder on proactive notifications.',
      resolvedAt: new Date(),
    });
  }

  // 12. Create Activity Logs
  await LogisticsActivity.create({
    partnerId: rameshPartner._id,
    actionType: 'TRIP_STARTED',
    title: 'Trip TRIP-302 Departed',
    description: 'Partner Ramesh Kumar commenced route from Darbhanga towards Benipur.',
    actorType: 'PARTNER',
  });

  await LogisticsActivity.create({
    partnerId: sureshPartner._id,
    actionType: 'WAYPOINT_REACHED',
    title: 'Reached Bahadurpur Waypoint',
    description: 'Auto delivery run TRIP-305 confirmed arrival at Bahadurpur waypoint.',
    actorType: 'PARTNER',
  });

  // 13. Ensure Village Agent Manohar Jha exists for Village Gajahra, Ladania, Madhubani
  let manoharUser = await User.findOne({ phone: '9835012344' });
  if (!manoharUser) {
    manoharUser = await User.create({
      name: 'Manohar Jha',
      phone: '9835012344',
      email: 'manohar.jha@localhaat.in',
      role: 'village_agent',
      isActive: true,
      kycStatus: 'verified',
      defaultLocation: {
        addressLine: 'Panchayat Bhawan Chowk, Village Gajahra',
        villageOrCity: 'Village Gajahra',
        district: 'Madhubani',
        state: 'Bihar',
        pincode: '847232',
        latitude: 26.5412,
        longitude: 86.291,
      },
    });
  }

  let manoharAgent = await VillageAgent.findOne({ hubCode: 'VH-BR-0321' });
  if (!manoharAgent) {
    manoharAgent = await VillageAgent.create({
      userId: manoharUser._id,
      villageName: 'Village Gajahra Hub (Ladania)',
      hubCode: 'VH-BR-0321',
      servingVillages: ['Village Gajahra', 'Ladania', 'Khutauna', 'Laukaha'],
      hubAddress: {
        addressLine: 'Panchayat Bhawan Chowk, Village Gajahra',
        villageOrCity: 'Village Gajahra',
        district: 'Madhubani',
        state: 'Bihar',
        pincode: '847232',
        latitude: 26.5412,
        longitude: 86.291,
      },
      commissionPerDelivery: 25,
      activeParcelsCount: 3,
      cashInHand: 1850,
      isAvailable: true,
      isOnline: true,
      status: 'ACTIVE',
      operationalStatus: 'ONLINE',
      verificationStatus: 'VERIFIED',
      rating: 4.95,
      totalDelivered: 148,
      workingHours: '08:00 AM - 07:30 PM',
    });
  }

  // 14. Partner: Bus Moving Towards Village Gajahra (Mahendra Yadav)
  let busDriverUser = await User.findOne({ phone: '9835011088' });
  if (!busDriverUser) {
    busDriverUser = await User.create({
      name: 'Mahendra Yadav (Gajahra Deluxe Bus)',
      phone: '9835011088',
      email: 'gajahra.bus@localhaat.in',
      role: 'logistics_partner',
      isActive: true,
      kycStatus: 'verified',
      defaultLocation: {
        addressLine: 'Central Bus Terminal Bay 4',
        villageOrCity: 'Madhubani',
        district: 'Madhubani',
        state: 'Bihar',
        pincode: '847211',
      },
    });
  }

  let busPartner = await LogisticsPartner.findOne({ partnerCode: 'LP-BUS-0401' });
  if (!busPartner) {
    busPartner = await LogisticsPartner.create({
      userId: busDriverUser._id,
      partnerCode: 'LP-BUS-0401',
      businessName: 'Mithila-Gajahra Gramin Bus Service',
      partnerType: 'fleet_owner',
      partnerCategory: 'PROFESSIONAL',
      partnerStatus: 'MOVING',
      verificationStatus: 'VERIFIED',
      phone: '9835011088',
      email: 'gajahra.bus@localhaat.in',
      primaryTransportType: 'Bus',
      vehicleNumber: 'BR-32-BUS-9012',
      capacityKg: 150,
      serviceAreas: ['Madhubani', 'Sakri', 'Ladania', 'Village Gajahra', 'Khutauna'],
      rating: 4.91,
      totalTrips: 312,
      totalParcelsDelivered: 1420,
      activeParcelsCount: 4,
      isActive: true,
      isOnline: true,
      isVerified: true,
      currentLocation: {
        latitude: 26.5412,
        longitude: 86.291,
        locationName: 'Approaching Ladania on Gajahra Highway Corridor',
        lastUpdated: new Date(),
      },
      commissionRatePerKm: 8,
      baseDeliveryFee: 55,
      totalEarnings: 48200,
      walletBalance: 6450,
      bankDetails: {
        accountHolderName: 'Mahendra Yadav',
        accountNumber: '581920194812',
        ifscCode: 'SBIN0002144',
        bankName: 'State Bank of India Madhubani',
        upiId: 'gajahra.bus@oksbi',
      },
      documents: [
        {
          docType: 'COMMERCIAL_PERMIT',
          documentNumber: 'PERMIT-BR-2024-9012',
          fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
          status: 'VERIFIED',
          verifiedAt: new Date(Date.now() - 40 * 86400000),
        },
        {
          docType: 'RC_BOOK',
          documentNumber: 'RC-BR32BUS9012',
          fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
          status: 'VERIFIED',
          verifiedAt: new Date(Date.now() - 40 * 86400000),
        },
      ],
    });
  }

  let busVehicle = await Vehicle.findOne({ registrationNumber: 'BR-32-BUS-9012' });
  if (!busVehicle) {
    busVehicle = await Vehicle.create({
      partnerId: busPartner._id,
      vehicleType: 'Bus',
      registrationNumber: 'BR-32-BUS-9012',
      modelName: 'Tata Starbus Ultra Rural Express (Roof Carrier & Cargo Boot)',
      maxCapacityKg: 150,
      currentStatus: 'in_transit',
      currentCoordinates: {
        latitude: 26.5412,
        longitude: 86.291,
        lastUpdated: new Date(),
      },
    });
    busPartner.vehicleIds = [busVehicle._id as any];
    await busPartner.save();
  }

  let busRoute = await PartnerRoute.findOne({ partnerId: busPartner._id });
  if (!busRoute) {
    busRoute = await PartnerRoute.create({
      partnerId: busPartner._id,
      routeTitle: 'Madhubani -> Sakri -> Ladania -> Village Gajahra Highway Route',
      sourceLocation: {
        addressLine: 'Madhubani Central Bus Terminal',
        villageOrCity: 'Madhubani',
        district: 'Madhubani',
        state: 'Bihar',
        pincode: '847211',
      },
      destinationLocation: {
        addressLine: 'Panchayat Bhawan Central Drop Point',
        villageOrCity: 'Village Gajahra',
        district: 'Madhubani',
        state: 'Bihar',
        pincode: '847232',
      },
      waypoints: [
        {
          addressLine: 'Sakri Junction Station Chowk',
          villageOrCity: 'Sakri',
          district: 'Madhubani',
          state: 'Bihar',
          pincode: '847239',
        },
        {
          addressLine: 'Ladania Block Market',
          villageOrCity: 'Ladania',
          district: 'Madhubani',
          state: 'Bihar',
          pincode: '847232',
        },
      ],
      departureTime: '01:30 PM',
      travelDate: 'Today',
      vehicleType: 'Bus',
      capacityKg: 150,
      availableCapacityKg: 85,
      pricePerKg: 6,
      status: 'active',
    });
  }

  // Find or create parcels heading to Gajahra
  let gajahraParcel1 = await Parcel.findOne({ parcelId: 'LH-PKG-401006' });
  if (!gajahraParcel1) {
    gajahraParcel1 = await Parcel.create({
      parcelId: 'LH-PKG-401006',
      parcelTrackingNumber: 'LH-TRK-401006',
      senderName: 'Mithila Handicrafts Center',
      senderMobile: '9835012345',
      pickupLocation: 'Madhubani Town',
      pickupAddress: 'Shop 12, Station Road, Madhubani',
      receiverName: 'Ramesh Mishra',
      receiverMobile: '9835098765',
      deliveryLocation: 'Village Gajahra',
      deliveryAddress: 'Ward 4, Near High School, Gajahra',
      whatIsInside: 'Handcrafted Madhubani Painting & Silk Dupatta',
      parcelCategory: 'Art & Handicrafts',
      weightKg: 22.0,
      dimensions: { lengthCm: 45, widthCm: 35, heightCm: 25 },
      approximateValue: 7500,
      customerOfferPrice: 450,
      preferredLogisticsType: 'Bus',
      status: 'IN_TRANSIT',
      pickupCode: '1029',
      handoverCode: '401928',
      deliveryPin: '5812',
      currentLegIndex: 1,
      totalLegs: 3,
      currentPartnerId: busPartner._id,
      currentVehicleId: busVehicle._id,
      currentAgentId: manoharAgent?._id,
    });
  } else {
    gajahraParcel1.status = 'IN_TRANSIT';
    gajahraParcel1.currentPartnerId = busPartner._id;
    gajahraParcel1.currentVehicleId = busVehicle._id;
    await gajahraParcel1.save();
  }

  let gajahraParcel2 = await Parcel.findOne({ parcelId: 'LH-PKG-401001' });
  if (gajahraParcel2) {
    gajahraParcel2.status = 'IN_TRANSIT';
    gajahraParcel2.currentPartnerId = busPartner._id;
    gajahraParcel2.currentVehicleId = busVehicle._id;
    await gajahraParcel2.save();
  }

  const busParcelIds = [gajahraParcel1._id];
  if (gajahraParcel2) busParcelIds.push(gajahraParcel2._id);

  let busTrip = await LogisticsTrip.findOne({ tripId: 'TRIP-BUS-401' });
  if (!busTrip) {
    busTrip = await LogisticsTrip.create({
      tripId: 'TRIP-BUS-401',
      partnerId: busPartner._id,
      partnerName: 'Mahendra Yadav (Gajahra Deluxe Bus)',
      partnerMobile: '9835011088',
      partnerType: 'PROFESSIONAL',
      transportType: 'Bus',
      vehicleId: busVehicle._id,
      vehicleType: 'Bus',
      vehicleNumber: 'BR-32-BUS-9012',
      routeId: busRoute._id,
      routeTitle: 'Madhubani -> Sakri -> Ladania -> Village Gajahra Corridor Express',
      fromLocation: {
        villageOrCity: 'Madhubani',
        district: 'Madhubani',
        addressLine: 'Madhubani Central Bus Terminal',
      },
      toLocation: {
        villageOrCity: 'Village Gajahra',
        district: 'Madhubani',
        addressLine: 'Panchayat Bhawan / Haat Drop Point, Village Gajahra',
      },
      waypoints: [
        { villageOrCity: 'Sakri', district: 'Madhubani', order: 1, status: 'REACHED', reachedAt: new Date(Date.now() - 40 * 60 * 1000) },
        { villageOrCity: 'Ladania', district: 'Madhubani', order: 2, status: 'REACHED', reachedAt: new Date(Date.now() - 10 * 60 * 1000) },
        { villageOrCity: 'Village Gajahra', district: 'Madhubani', order: 3, status: 'PENDING' },
      ],
      departureTime: '01:30 PM',
      expectedArrival: '04:15 PM',
      actualDeparture: new Date(Date.now() - 75 * 60 * 1000),
      tripStatus: 'MOVING',
      totalCapacityKg: 150,
      usedCapacityKg: 65,
      availableCapacityKg: 85,
      parcelIds: busParcelIds,
      activeParcelCount: busParcelIds.length || 4,
      currentOperationalLocation: 'Ladania-Gajahra Highway (2.5 km to Gajahra)',
      gpsCoordinates: {
        latitude: 26.5412,
        longitude: 86.291,
        lastUpdated: new Date(),
      },
      routeProgress: 78,
      estimatedEarnings: 1150,
      notes: 'Rural transit bus moving towards Village Gajahra drop point (Agent Manohar Jha) with passenger luggage and commerce consignments.',
    });
  }

  // 15. Partner: Cab Moving Towards Sonapur, Ramnagar, Chunar Outer, Kachhwa (Rameshwar Yadav)
  let cabDriverUser = await User.findOne({ phone: '9835011099' });
  if (!cabDriverUser) {
    cabDriverUser = await User.create({
      name: 'Rameshwar Yadav (Vindhya Cab)',
      phone: '9835011099',
      email: 'rameshwar.cab@localhaat.in',
      role: 'logistics_partner',
      isActive: true,
      kycStatus: 'verified',
      defaultLocation: {
        addressLine: 'Sonapur Rural Taxi Stand & Haat',
        villageOrCity: 'Sonapur',
        district: 'Varanasi',
        state: 'Uttar Pradesh',
        pincode: '221008',
      },
    });
  }

  let cabPartner = await LogisticsPartner.findOne({ partnerCode: 'LP-CAB-0402' });
  if (!cabPartner) {
    cabPartner = await LogisticsPartner.create({
      userId: cabDriverUser._id,
      partnerCode: 'LP-CAB-0402',
      businessName: 'Vindhya-Sonapur Rural Cab Logistics',
      partnerType: 'individual',
      partnerCategory: 'PROFESSIONAL',
      partnerStatus: 'MOVING',
      verificationStatus: 'VERIFIED',
      phone: '9835011099',
      email: 'rameshwar.cab@localhaat.in',
      primaryTransportType: 'Cab',
      vehicleNumber: 'UP-65-CAB-4411',
      capacityKg: 80,
      serviceAreas: ['Sonapur', 'Ramnagar', 'Chunar Outer', 'Kachhwa', 'Mirzapur Corridor'],
      rating: 4.94,
      totalTrips: 146,
      totalParcelsDelivered: 490,
      activeParcelsCount: 3,
      isActive: true,
      isOnline: true,
      isVerified: true,
      currentLocation: {
        latitude: 25.2105,
        longitude: 82.9641,
        locationName: 'Between Ramnagar and Chunar Outer Corridor',
        lastUpdated: new Date(),
      },
      commissionRatePerKm: 12,
      baseDeliveryFee: 45,
      totalEarnings: 29800,
      walletBalance: 5120,
      bankDetails: {
        accountHolderName: 'Rameshwar Yadav',
        accountNumber: '492019482931',
        ifscCode: 'BARB0RAMNAG',
        bankName: 'Bank of Baroda Ramnagar Branch',
        upiId: 'rameshwar.cab@barodampay',
      },
      documents: [
        {
          docType: 'DRIVING_LICENSE',
          documentNumber: 'DL-UP65-2017-4411',
          fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
          status: 'VERIFIED',
          verifiedAt: new Date(Date.now() - 50 * 86400000),
        },
        {
          docType: 'RC_BOOK',
          documentNumber: 'RC-UP65CAB4411',
          fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
          status: 'VERIFIED',
          verifiedAt: new Date(Date.now() - 50 * 86400000),
        },
      ],
    });
  }

  let cabVehicle = await Vehicle.findOne({ registrationNumber: 'UP-65-CAB-4411' });
  if (!cabVehicle) {
    cabVehicle = await Vehicle.create({
      partnerId: cabPartner._id,
      vehicleType: 'Cab',
      registrationNumber: 'UP-65-CAB-4411',
      modelName: 'Maruti Suzuki Tour Cab (Boot & Roof Cargo Luggage Spec)',
      maxCapacityKg: 80,
      currentStatus: 'in_transit',
      currentCoordinates: {
        latitude: 25.2105,
        longitude: 82.9641,
        lastUpdated: new Date(),
      },
    });
    cabPartner.vehicleIds = [cabVehicle._id as any];
    await cabPartner.save();
  }

  let cabRoute = await PartnerRoute.findOne({ partnerId: cabPartner._id });
  if (!cabRoute) {
    cabRoute = await PartnerRoute.create({
      partnerId: cabPartner._id,
      routeTitle: 'Sonapur -> Ramnagar -> Chunar Outer -> Kachhwa Corridor Express',
      sourceLocation: {
        addressLine: 'Sonapur Rural Taxi Stand & Haat',
        villageOrCity: 'Sonapur',
        district: 'Varanasi',
        state: 'Uttar Pradesh',
        pincode: '221008',
      },
      destinationLocation: {
        addressLine: 'Kachhwa Market Central Drop Point',
        villageOrCity: 'Kachhwa',
        district: 'Mirzapur',
        state: 'Uttar Pradesh',
        pincode: '231501',
      },
      waypoints: [
        {
          addressLine: 'Ramnagar Fort Chowk',
          villageOrCity: 'Ramnagar',
          district: 'Varanasi',
          state: 'Uttar Pradesh',
          pincode: '221008',
        },
        {
          addressLine: 'Chunar Outer Highway Crossing',
          villageOrCity: 'Chunar Outer',
          district: 'Mirzapur',
          state: 'Uttar Pradesh',
          pincode: '231304',
        },
      ],
      departureTime: '02:00 PM',
      travelDate: 'Today',
      vehicleType: 'Cab',
      capacityKg: 80,
      availableCapacityKg: 45,
      pricePerKg: 14,
      status: 'active',
    });
  }

  // Dedicated parcels along Sonapur -> Ramnagar -> Chunar Outer -> Kachhwa
  let cabParcel1 = await Parcel.findOne({ parcelId: 'LH-PKG-CAB-001' });
  if (!cabParcel1) {
    cabParcel1 = await Parcel.create({
      parcelId: 'LH-PKG-CAB-001',
      parcelTrackingNumber: 'LH-TRK-CAB-001',
      senderName: 'Banaras Agro Traders',
      senderMobile: '9839012301',
      pickupLocation: 'Sonapur Rural Hub',
      pickupAddress: 'Shop 4, Sonapur Haat Mandi',
      receiverName: 'Ramnagar Farmer Cooperative',
      receiverMobile: '9839098701',
      deliveryLocation: 'Ramnagar',
      deliveryAddress: 'Near Fort Gate, Ramnagar',
      whatIsInside: 'Hybrid Vegetable Seeds & Bio Fertilizers',
      parcelCategory: 'Agro & Farm Inputs',
      weightKg: 12.0,
      dimensions: { lengthCm: 35, widthCm: 30, heightCm: 25 },
      approximateValue: 3600,
      customerOfferPrice: 220,
      preferredLogisticsType: 'Cab',
      status: 'IN_TRANSIT',
      pickupCode: '2419',
      handoverCode: '610294',
      deliveryPin: '3910',
      currentLegIndex: 1,
      totalLegs: 3,
      currentPartnerId: cabPartner._id,
      currentVehicleId: cabVehicle._id,
    });
  }

  let cabParcel2 = await Parcel.findOne({ parcelId: 'LH-PKG-CAB-002' });
  if (!cabParcel2) {
    cabParcel2 = await Parcel.create({
      parcelId: 'LH-PKG-CAB-002',
      parcelTrackingNumber: 'LH-TRK-CAB-002',
      senderName: 'Kashi Clay Art Guild',
      senderMobile: '9839012302',
      pickupLocation: 'Sonapur Rural Hub',
      pickupAddress: 'Sonapur Artisan Cluster Block B',
      receiverName: 'Chunar Pottery Artisan Unit',
      receiverMobile: '9839098702',
      deliveryLocation: 'Chunar Outer',
      deliveryAddress: 'Chunar Outer Highway Workshop, Near Bridge',
      whatIsInside: 'Ceramic Glaze Minerals & Craft Equipment',
      parcelCategory: 'Handicrafts & Materials',
      weightKg: 8.5,
      dimensions: { lengthCm: 30, widthCm: 25, heightCm: 20 },
      approximateValue: 2800,
      customerOfferPrice: 190,
      preferredLogisticsType: 'Cab',
      status: 'IN_TRANSIT',
      pickupCode: '5821',
      handoverCode: '918472',
      deliveryPin: '4021',
      currentLegIndex: 1,
      totalLegs: 3,
      currentPartnerId: cabPartner._id,
      currentVehicleId: cabVehicle._id,
    });
  }

  let cabParcel3 = await Parcel.findOne({ parcelId: 'LH-PKG-CAB-003' });
  if (!cabParcel3) {
    cabParcel3 = await Parcel.create({
      parcelId: 'LH-PKG-CAB-003',
      parcelTrackingNumber: 'LH-TRK-CAB-003',
      senderName: 'Sonapur Haat Electronics',
      senderMobile: '9839012303',
      pickupLocation: 'Sonapur Rural Hub',
      pickupAddress: 'Main Market Road, Sonapur',
      receiverName: 'Kachhwa Digital Seva Kendra',
      receiverMobile: '9839098703',
      deliveryLocation: 'Kachhwa',
      deliveryAddress: 'Shop 10, Kachhwa Bazaar, Mirzapur',
      whatIsInside: 'Biometric Scanners & Receipt Printer Terminals',
      parcelCategory: 'Electronics & IT',
      weightKg: 6.2,
      dimensions: { lengthCm: 28, widthCm: 22, heightCm: 18 },
      approximateValue: 8900,
      customerOfferPrice: 310,
      preferredLogisticsType: 'Cab',
      status: 'IN_TRANSIT',
      pickupCode: '7741',
      handoverCode: '391048',
      deliveryPin: '8201',
      currentLegIndex: 1,
      totalLegs: 3,
      currentPartnerId: cabPartner._id,
      currentVehicleId: cabVehicle._id,
    });
  }

  let cabTrip = await LogisticsTrip.findOne({ tripId: 'TRIP-CAB-402' });
  if (!cabTrip) {
    cabTrip = await LogisticsTrip.create({
      tripId: 'TRIP-CAB-402',
      partnerId: cabPartner._id,
      partnerName: 'Rameshwar Yadav (Vindhya Cab)',
      partnerMobile: '9835011099',
      partnerType: 'PROFESSIONAL',
      transportType: 'Cab',
      vehicleId: cabVehicle._id,
      vehicleType: 'Cab',
      vehicleNumber: 'UP-65-CAB-4411',
      routeId: cabRoute._id,
      routeTitle: 'Sonapur -> Ramnagar -> Chunar Outer -> Kachhwa Corridor Express',
      fromLocation: {
        villageOrCity: 'Sonapur',
        district: 'Varanasi',
        addressLine: 'Sonapur Rural Taxi Stand & Haat',
      },
      toLocation: {
        villageOrCity: 'Kachhwa',
        district: 'Mirzapur',
        addressLine: 'Kachhwa Central Market Delivery Point',
      },
      waypoints: [
        { villageOrCity: 'Sonapur', district: 'Varanasi', order: 1, status: 'REACHED', reachedAt: new Date(Date.now() - 55 * 60 * 1000) },
        { villageOrCity: 'Ramnagar', district: 'Varanasi', order: 2, status: 'REACHED', reachedAt: new Date(Date.now() - 20 * 60 * 1000) },
        { villageOrCity: 'Chunar Outer', district: 'Mirzapur', order: 3, status: 'PENDING' },
        { villageOrCity: 'Kachhwa', district: 'Mirzapur', order: 4, status: 'PENDING' },
      ],
      departureTime: '02:00 PM',
      expectedArrival: '04:30 PM',
      actualDeparture: new Date(Date.now() - 55 * 60 * 1000),
      tripStatus: 'MOVING',
      totalCapacityKg: 80,
      usedCapacityKg: 35,
      availableCapacityKg: 45,
      parcelIds: [cabParcel1._id, cabParcel2._id, cabParcel3._id],
      activeParcelCount: 3,
      currentOperationalLocation: 'Passing Chunar Outer Link Road (en route to Kachhwa)',
      gpsCoordinates: {
        latitude: 25.2105,
        longitude: 82.9641,
        lastUpdated: new Date(),
      },
      routeProgress: 52,
      estimatedEarnings: 740,
      notes: 'Commercial cab moving along the Sonapur -> Ramnagar -> Chunar Outer -> Kachhwa corridor carrying high-priority direct rural parcels.',
    });
  }

  // Additional Activity Logs
  await LogisticsActivity.create({
    partnerId: busPartner._id,
    actionType: 'TRIP_STARTED',
    title: 'Bus TRIP-BUS-401 Moving Towards Village Gajahra',
    description: 'Bus departed Madhubani, cleared Sakri & Ladania, heading towards Village Gajahra agent Manohar Jha drop hub.',
    actorType: 'PARTNER',
  });

  await LogisticsActivity.create({
    partnerId: cabPartner._id,
    actionType: 'WAYPOINT_REACHED',
    title: 'Cab TRIP-CAB-402 Reached Ramnagar, Moving towards Chunar Outer & Kachhwa',
    description: 'Cab run confirmed arrival at Ramnagar, heading onwards to Chunar Outer and Kachhwa drop point.',
    actorType: 'PARTNER',
  });

  // 16. Create Showcase Multi-Stop Scheduled Trip TRIP-1001 (Sections 1-17, 24, 28)
  await LogisticsTrip.deleteOne({ tripId: 'TRIP-1001' });
  await Parcel.deleteMany({ parcelId: { $in: ['PCL-1001', 'PCL-1004', 'PCL-1002', 'PCL-1007', 'PCL-1008', 'LH-PKG-DEMO-SAKRI', 'LH-PKG-DEMO-PANDAUL', 'LH-PKG-DEMO-REVERSE'] } });

  // Dedicated Parcels for TRIP-1001 assigned to specific stops:
  // PCL-1001: Darbhanga -> Sakri (Destination Stop: Sakri, Drop ETA: 08:50 AM)
  const pcl1001 = await Parcel.create({
    parcelId: 'PCL-1001',
    parcelTrackingNumber: 'LH-TRK-100101',
    senderName: 'Mithila Khadi Emporium',
    senderMobile: '9835019283',
    pickupLocation: 'Darbhanga',
    pickupAddress: 'Tower Chowk, Darbhanga',
    receiverName: 'Rameshwar Cloth Store',
    receiverMobile: '9835081928',
    deliveryLocation: 'Sakri',
    deliveryAddress: 'Near Railway Station Market, Sakri',
    whatIsInside: 'Pure Cotton Handloom Sarees & Kurtas',
    parcelCategory: 'Textiles & Apparel',
    weightKg: 2.5,
    customerOfferPrice: 180,
    preferredDeliveryDate: '10 Oct 2026',
    preferredLogisticsType: 'Bike',
    status: 'IN_TRANSIT',
    pickupCode: '4019',
    handoverCode: '891024',
    deliveryPin: '3819',
    pickupStopId: 'START',
    pickupStopName: 'Darbhanga',
    pickupStopOrder: 1,
    destinationStopId: 'STOP-1',
    destinationStopName: 'Sakri',
    destinationStopOrder: 2,
    expectedPickupTime: '08:00 AM',
    expectedDeliveryTime: '08:50 AM',
    assignedTripCode: 'TRIP-1001',
    currentPartnerId: rameshPartner._id as any,
    currentVehicleId: rameshVehicle?._id as any,
  });

  // PCL-1004: Darbhanga -> Pandaul (Destination Stop: Pandaul, Drop ETA: 09:45 AM)
  const pcl1004 = await Parcel.create({
    parcelId: 'PCL-1004',
    parcelTrackingNumber: 'LH-TRK-100104',
    senderName: 'Darbhanga Agro Seeds & Tools',
    senderMobile: '9835048192',
    pickupLocation: 'Darbhanga',
    pickupAddress: 'Benta Road, Darbhanga',
    receiverName: 'Pandaul Kisan Seva Center',
    receiverMobile: '9835091823',
    deliveryLocation: 'Pandaul',
    deliveryAddress: 'Main Block Chowk, Pandaul',
    whatIsInside: 'Organic Wheat Seed Packs & Bio Nutrients',
    parcelCategory: 'Agriculture',
    weightKg: 3.5,
    customerOfferPrice: 220,
    preferredDeliveryDate: '10 Oct 2026',
    preferredLogisticsType: 'Bike',
    status: 'IN_TRANSIT',
    pickupCode: '7291',
    handoverCode: '310492',
    deliveryPin: '9012',
    pickupStopId: 'START',
    pickupStopName: 'Darbhanga',
    pickupStopOrder: 1,
    destinationStopId: 'STOP-2',
    destinationStopName: 'Pandaul',
    destinationStopOrder: 3,
    expectedPickupTime: '08:00 AM',
    expectedDeliveryTime: '09:45 AM',
    assignedTripCode: 'TRIP-1001',
    currentPartnerId: rameshPartner._id as any,
    currentVehicleId: rameshVehicle?._id as any,
  });

  // PCL-1002: Darbhanga -> Madhubani (Destination Stop: Madhubani, Drop ETA: 11:30 AM)
  const pcl1002 = await Parcel.create({
    parcelId: 'PCL-1002',
    parcelTrackingNumber: 'LH-TRK-100102',
    senderName: 'Sita Ram Book Depot',
    senderMobile: '9835061928',
    pickupLocation: 'Darbhanga',
    pickupAddress: 'Lalbagh, Darbhanga',
    receiverName: 'Mithila College Library',
    receiverMobile: '9835071928',
    deliveryLocation: 'Madhubani',
    deliveryAddress: 'Station Road, Madhubani',
    whatIsInside: 'Competitive Exam Books & Encyclopedias',
    parcelCategory: 'Education & Books',
    weightKg: 4.0,
    customerOfferPrice: 260,
    preferredDeliveryDate: '10 Oct 2026',
    preferredLogisticsType: 'Bike',
    status: 'IN_TRANSIT',
    pickupCode: '5812',
    handoverCode: '741902',
    deliveryPin: '4190',
    pickupStopId: 'START',
    pickupStopName: 'Darbhanga',
    pickupStopOrder: 1,
    destinationStopId: 'FINAL',
    destinationStopName: 'Madhubani',
    destinationStopOrder: 4,
    expectedPickupTime: '08:00 AM',
    expectedDeliveryTime: '11:30 AM',
    assignedTripCode: 'TRIP-1001',
    currentPartnerId: rameshPartner._id as any,
    currentVehicleId: rameshVehicle?._id as any,
  });

  // PCL-1007: Darbhanga -> Sakri (Second parcel for Sakri stop)
  const pcl1007 = await Parcel.create({
    parcelId: 'PCL-1007',
    parcelTrackingNumber: 'LH-TRK-100107',
    senderName: 'Apex Diagnostics Lab',
    senderMobile: '9835039182',
    pickupLocation: 'Darbhanga',
    pickupAddress: 'DMCH Road, Darbhanga',
    receiverName: 'Sakri Rural Clinic Dr. K.K. Jha',
    receiverMobile: '9835081729',
    deliveryLocation: 'Sakri',
    deliveryAddress: 'Main Hospital Road, Sakri',
    whatIsInside: 'Urgent Pathology Diagnostic Test Kits',
    parcelCategory: 'Medical & Healthcare',
    weightKg: 1.2,
    customerOfferPrice: 190,
    preferredDeliveryDate: '10 Oct 2026',
    preferredLogisticsType: 'Bike',
    status: 'IN_TRANSIT',
    pickupCode: '9102',
    handoverCode: '582910',
    deliveryPin: '6102',
    pickupStopId: 'START',
    pickupStopName: 'Darbhanga',
    pickupStopOrder: 1,
    destinationStopId: 'STOP-1',
    destinationStopName: 'Sakri',
    destinationStopOrder: 2,
    expectedPickupTime: '08:00 AM',
    expectedDeliveryTime: '08:50 AM',
    assignedTripCode: 'TRIP-1001',
    currentPartnerId: rameshPartner._id as any,
    currentVehicleId: rameshVehicle?._id as any,
  });

  // PCL-1008: Sakri -> Pandaul (Intermediate Stop to Intermediate Stop!)
  const pcl1008 = await Parcel.create({
    parcelId: 'PCL-1008',
    parcelTrackingNumber: 'LH-TRK-100108',
    senderName: 'Sakri Hardware Mart',
    senderMobile: '9835091726',
    pickupLocation: 'Sakri',
    pickupAddress: 'Chowk Market, Sakri',
    receiverName: 'Pandaul Agro Machinery Workshop',
    receiverMobile: '9835028192',
    deliveryLocation: 'Pandaul',
    deliveryAddress: 'Sugar Mill Road, Pandaul',
    whatIsInside: 'Tractor Replacement Fan Belts & Lubricants',
    parcelCategory: 'Hardware & Machinery',
    weightKg: 2.8,
    customerOfferPrice: 160,
    preferredDeliveryDate: '10 Oct 2026',
    preferredLogisticsType: 'Bike',
    status: 'IN_TRANSIT',
    pickupCode: '6192',
    handoverCode: '401928',
    deliveryPin: '8291',
    pickupStopId: 'STOP-1',
    pickupStopName: 'Sakri',
    pickupStopOrder: 2,
    destinationStopId: 'STOP-2',
    destinationStopName: 'Pandaul',
    destinationStopOrder: 3,
    expectedPickupTime: '09:00 AM',
    expectedDeliveryTime: '09:45 AM',
    assignedTripCode: 'TRIP-1001',
    currentPartnerId: rameshPartner._id as any,
    currentVehicleId: rameshVehicle?._id as any,
  });

  const carried1001Ids = [pcl1001._id, pcl1004._id, pcl1002._id, pcl1007._id, pcl1008._id];

  // Create the Trip TRIP-1001 as SCHEDULED
  const trip1001Doc = await LogisticsTrip.create({
    tripId: 'TRIP-1001',
    partnerId: rameshPartner._id,
    partnerName: 'Ramesh Kumar',
    partnerMobile: '9835011001',
    partnerType: 'PROFESSIONAL',
    transportType: 'Bike',
    vehicleId: rameshVehicle?._id,
    vehicleType: 'Bike',
    vehicleNumber: 'BR-07-AB-4021',
    routeTitle: 'Darbhanga ➔ Sakri ➔ Pandaul ➔ Madhubani Scheduled Line',
    travelDate: '10 Oct 2026',
    startLocation: {
      name: 'Darbhanga',
      villageOrCity: 'Darbhanga',
      address: 'Central Haat Depot, Darbhanga',
      departureTime: '08:00 AM',
      status: 'PENDING',
    },
    stops: [
      {
        stopId: 'STOP-1',
        stopOrder: 1,
        name: 'Sakri',
        villageOrCity: 'Sakri',
        address: 'Sakri Railway Station Chowk',
        expectedArrival: '08:50 AM',
        expectedDeparture: '09:00 AM',
        waitingMinutes: 10,
        status: 'UPCOMING',
      },
      {
        stopId: 'STOP-2',
        stopOrder: 2,
        name: 'Pandaul',
        villageOrCity: 'Pandaul',
        address: 'Pandaul Market Crossing',
        expectedArrival: '09:45 AM',
        expectedDeparture: '09:55 AM',
        waitingMinutes: 10,
        status: 'UPCOMING',
      },
    ],
    finalDestination: {
      name: 'Madhubani',
      villageOrCity: 'Madhubani',
      address: 'Madhubani Town Bus Stand & Cargo Drop',
      expectedArrival: '11:30 AM',
      status: 'UPCOMING',
    },
    fromLocation: {
      villageOrCity: 'Darbhanga',
      district: 'Darbhanga',
      addressLine: 'Central Haat Depot, Darbhanga',
    },
    toLocation: {
      villageOrCity: 'Madhubani',
      district: 'Madhubani',
      addressLine: 'Madhubani Town Bus Stand',
    },
    waypoints: [
      { villageOrCity: 'Sakri', order: 1, status: 'PENDING' },
      { villageOrCity: 'Pandaul', order: 2, status: 'PENDING' },
    ],
    departureTime: '08:00 AM',
    expectedArrival: '11:30 AM',
    tripStatus: 'SCHEDULED',
    totalCapacityKg: 20,
    usedCapacityKg: 14,
    availableCapacityKg: 6,
    parcelIds: carried1001Ids,
    activeParcelCount: carried1001Ids.length,
    currentOperationalLocation: 'Central Haat Depot, Darbhanga (Scheduled Line for 10 Oct 2026)',
    gpsCoordinates: {
      latitude: 26.1542,
      longitude: 85.8918,
      lastUpdated: new Date(),
    },
    routeProgress: 0,
    estimatedEarnings: 920,
    notes: 'Scheduled corridor delivery: Darbhanga to Madhubani carrying parcels for Sakri, Pandaul, and Madhubani on 10 Oct 2026.',
  });

  // Update parcel links to this trip
  await Parcel.updateMany({ _id: { $in: carried1001Ids } }, { assignedTripId: trip1001Doc._id });

    // Seed Unbooked Demonstration Parcels for Admin Matching:
    // 1. Darbhanga -> Sakri (Must match TRIP-1001 at ~96% score with ETA 08:50 AM)
    let demoSakri = await Parcel.findOne({ parcelId: 'LH-PKG-DEMO-SAKRI' });
    if (!demoSakri) {
      await Parcel.create({
        parcelId: 'LH-PKG-DEMO-SAKRI',
        parcelTrackingNumber: 'LH-TRK-DEMO-SAKRI',
        senderName: 'Sunil Mahto (Artisan)',
        senderMobile: '9835012399',
        pickupLocation: 'Darbhanga',
        pickupAddress: 'Bara Bazaar, Darbhanga',
        receiverName: 'Manoj Thakur',
        receiverMobile: '9835081999',
        deliveryLocation: 'Sakri',
        deliveryAddress: 'Hospital Road, Sakri',
        whatIsInside: 'Handcrafted Bamboo Baskets & Decorative Trays',
        parcelCategory: 'Art & Handicrafts',
        weightKg: 2.0,
        customerOfferPrice: 150,
        preferredDeliveryDate: '10 Oct 2026',
        preferredLogisticsType: 'Bike',
        status: 'SEARCHING_FOR_PARTNER',
        pickupCode: '1029',
        handoverCode: '401928',
        deliveryPin: '5812',
      });
    }

    // 2. Darbhanga -> Pandaul (Must match TRIP-1001 on Pandaul stop with ETA 09:45 AM)
    let demoPandaul = await Parcel.findOne({ parcelId: 'LH-PKG-DEMO-PANDAUL' });
    if (!demoPandaul) {
      await Parcel.create({
        parcelId: 'LH-PKG-DEMO-PANDAUL',
        parcelTrackingNumber: 'LH-TRK-DEMO-PANDAUL',
        senderName: 'Pooja Kumari',
        senderMobile: '9835067811',
        pickupLocation: 'Darbhanga',
        pickupAddress: 'Tower Chowk, Darbhanga',
        receiverName: 'Suresh Das',
        receiverMobile: '9835043222',
        deliveryLocation: 'Pandaul',
        deliveryAddress: 'Near Block High School, Pandaul',
        whatIsInside: 'Traditional Madhubani Painting Framed Artwork',
        parcelCategory: 'Art & Handicrafts',
        weightKg: 1.5,
        customerOfferPrice: 170,
        preferredDeliveryDate: '10 Oct 2026',
        preferredLogisticsType: 'Bike',
        status: 'SEARCHING_FOR_PARTNER',
        pickupCode: '8319',
        handoverCode: '2948',
        deliveryPin: '4291',
      });
    }

    // 3. Pandaul -> Sakri (Reverse direction! Must NOT match TRIP-1001, Sections 12 & 31)
    let demoReverse = await Parcel.findOne({ parcelId: 'LH-PKG-DEMO-REVERSE' });
    if (!demoReverse) {
      await Parcel.create({
        parcelId: 'LH-PKG-DEMO-REVERSE',
        parcelTrackingNumber: 'LH-TRK-DEMO-REVERSE',
        senderName: 'Gopal Yadav',
        senderMobile: '9835077122',
        pickupLocation: 'Pandaul',
        pickupAddress: 'Pandaul Chowk',
        receiverName: 'Vikram Singh',
        receiverMobile: '9835088233',
        deliveryLocation: 'Sakri',
        deliveryAddress: 'Sakri Bazaar',
        whatIsInside: 'Agro Spares (Reverse Route Test)',
        parcelCategory: 'Hardware',
        weightKg: 3.0,
        customerOfferPrice: 160,
        preferredDeliveryDate: '10 Oct 2026',
        preferredLogisticsType: 'Bike',
        status: 'SEARCHING_FOR_PARTNER',
        pickupCode: '3192',
        handoverCode: '829104',
        deliveryPin: '9034',
      });
    }

    // 4. Ensure Kashi Rural Express (9999900003) and TRIP-1002 exist in operational dataset
    let kashiPartner = await LogisticsPartner.findOne({ phone: '9999900003' });
    if (!kashiPartner) {
      const kUser = await User.findOne({ phone: '9999900003' });
      if (kUser) {
        kashiPartner = await LogisticsPartner.create({
          userId: kUser._id,
          partnerCode: 'LP-1002',
          businessName: 'Kashi Rural Express Logistics',
          partnerType: 'transporter',
          partnerCategory: 'PROFESSIONAL',
          partnerStatus: 'ONLINE',
          verificationStatus: 'VERIFIED',
          phone: '9999900003',
          email: 'balwant.singh@kashirural.in',
          primaryTransportType: 'Bike',
          vehicleNumber: 'UP65-BT-4921',
          capacityKg: 1200,
          serviceAreas: ['Sonapur', 'Ramnagar', 'Chunar', 'Varanasi Rural', 'Mirzapur Outer'],
          rating: 4.95,
          totalTrips: 142,
          totalParcelsDelivered: 580,
          isActive: true,
          isVerified: true,
          isOnline: true,
        });
      }
    } else {
      kashiPartner.verificationStatus = 'VERIFIED';
      kashiPartner.partnerCategory = 'PROFESSIONAL';
      kashiPartner.partnerStatus = 'ONLINE';
      kashiPartner.isActive = true;
      kashiPartner.isVerified = true;
      kashiPartner.isOnline = true;
      await kashiPartner.save();
    }

    if (kashiPartner) {
      let trip1002 = await LogisticsTrip.findOne({ tripId: 'TRIP-1002' });
      if (!trip1002) {
        let kRoute = await PartnerRoute.findOne({ partnerId: kashiPartner._id });
        if (!kRoute) {
          kRoute = await PartnerRoute.create({
            partnerId: kashiPartner._id,
            routeTitle: 'Sonapur Artisan Cluster <-> Ramnagar Village Haat Corridor',
            sourceLocation: { villageOrCity: 'Sonapur', addressLine: 'Shop 4, Sonapur Haat Mandi' },
            destinationLocation: { villageOrCity: 'Ramnagar', addressLine: 'Near Fort Gate, Ramnagar' },
            waypoints: [
              {
                addressLine: 'Chunar Riverbank Hub',
                villageOrCity: 'Chunar',
                district: 'Mirzapur',
                state: 'Uttar Pradesh',
                pincode: '231304',
              },
            ],
            scheduledFrequency: 'daily',
            departureTime: '08:30 AM',
            travelDate: 'Today',
            vehicleType: 'Bike',
            capacityKg: 1200,
            availableCapacityKg: 1200,
            pricePerKg: 7.5,
            status: 'active',
          });
        }

        await LogisticsTrip.create({
          tripId: 'TRIP-1002',
          partnerId: kashiPartner._id,
          partnerName: 'Kashi Rural Express Logistics',
          partnerMobile: '9999900003',
          partnerType: 'PROFESSIONAL',
          transportType: 'Bike',
          vehicleType: 'Bike',
          vehicleNumber: 'UP65-BT-4921',
          routeId: kRoute._id,
          routeTitle: 'Sonapur ➔ Ramnagar Scheduled Corridor',
          travelDate: 'Today',
          fromLocation: { villageOrCity: 'Sonapur', addressLine: 'Shop 4, Sonapur Haat Mandi' },
          toLocation: { villageOrCity: 'Ramnagar', addressLine: 'Near Fort Gate, Ramnagar' },
          startLocation: {
            name: 'Sonapur',
            villageOrCity: 'Sonapur',
            address: 'Shop 4, Sonapur Haat Mandi',
            departureTime: '08:30 AM',
            status: 'PENDING',
          },
          finalDestination: {
            name: 'Ramnagar',
            villageOrCity: 'Ramnagar',
            address: 'Near Fort Gate, Ramnagar',
            expectedArrival: '11:00 AM',
            status: 'UPCOMING',
          },
          waypoints: [
            {
              addressLine: 'Chunar Riverbank Hub',
              villageOrCity: 'Chunar',
              district: 'Mirzapur',
              state: 'Uttar Pradesh',
              pincode: '231304',
            },
          ],
          stops: [
            {
              stopId: 'STOP-1',
              stopOrder: 1,
              name: 'Chunar',
              villageOrCity: 'Chunar',
              address: 'Chunar Riverbank Hub',
              expectedArrival: '09:30 AM',
              expectedDeparture: '09:40 AM',
              waitingMinutes: 10,
              status: 'UPCOMING',
            },
          ],
          departureTime: '08:30 AM',
          expectedArrival: '11:00 AM',
          tripStatus: 'SCHEDULED',
          totalCapacityKg: 1200,
          usedCapacityKg: 0,
          availableCapacityKg: 1200,
          pricePerKg: 7.5,
          parcelIds: [],
          activeParcelCount: 0,
          notes: 'Daily scheduled route between Sonapur and Ramnagar haat cluster.',
        });
      }
    }

  console.log('[SeedLogistics] Operational logistics dataset successfully seeded!');
};
