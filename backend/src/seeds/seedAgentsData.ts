import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import {
  User,
  VillageAgent,
  KycDocument,
  AgentReview,
  AgentComplaint,
  AgentActivity,
  AdminAuditLog,
  Earning,
  Payout,
  Parcel,
} from '../models/index.js';

export const seedRichAgents = async () => {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }
  console.log('[SeedAgents] Enriching Village Agents ecosystem in MongoDB...');

  // 1. Get or create admin for audit references
  let admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    const adminHashedPassword = await bcrypt.hash('gokul@1996', 10);
    admin = await User.create({
      name: 'Gokul (Admin)',
      phone: '9999900001',
      email: 'gokul@localhaat.in',
      password: adminHashedPassword,
      role: 'admin',
      isActive: true,
      kycStatus: 'verified',
    });
  }

  // 2. Sample customers for reviews and complaints
  let customer1 = await User.findOne({ phone: '9999900005' });
  if (!customer1) {
    customer1 = await User.create({
      name: 'Priya Verma',
      phone: '9999900005',
      email: 'priya.verma@example.com',
      role: 'customer',
      isActive: true,
      kycStatus: 'verified',
      defaultLocation: {
        addressLine: 'Ward 4, Near Panchayat Bhavan',
        villageOrCity: 'Sonapur',
        district: 'Varanasi',
        state: 'Uttar Pradesh',
        pincode: '221005',
      },
    });
  }

  let customer2 = await User.findOne({ phone: '9999900006' });
  if (!customer2) {
    customer2 = await User.create({
      name: 'Suraj Bhan Singh',
      phone: '9999900006',
      email: 'suraj.singh@example.com',
      role: 'customer',
      isActive: true,
      kycStatus: 'verified',
      defaultLocation: {
        addressLine: 'House 12, Market Chowk',
        villageOrCity: 'Danapur Cantt',
        district: 'Patna',
        state: 'Bihar',
        pincode: '801503',
      },
    });
  }

  // 3. Define 6 Diverse Agents
  const agentProfiles = [
    {
      phone: '9999900004',
      name: 'Dinesh Kumar Patel',
      email: 'dinesh.agent@localhaat.in',
      villageName: 'Sonapur & Ramnagar Haat Cluster',
      hubCode: 'VH-UP-0042',
      servingVillages: ['Sonapur', 'Ramnagar', 'Chunar Outer', 'Kachhwa'],
      addressLine: 'Haat Bazar, Ramnagar Crossing',
      villageOrCity: 'Ramnagar',
      district: 'Varanasi',
      state: 'Uttar Pradesh',
      pincode: '221008',
      status: 'ACTIVE',
      operationalStatus: 'ONLINE',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      rating: 4.95,
      totalDelivered: 215,
      cashInHand: 1450,
      commissionPerDelivery: 30,
      workingHours: '07:30 AM - 08:00 PM',
      liveLocation: { latitude: 25.2677, longitude: 83.0294, updatedAt: new Date(), isSharing: true },
      bankDetails: {
        accountHolder: 'Dinesh Kumar Patel',
        accountNumber: '381920019283',
        ifscCode: 'SBIN0001248',
        bankName: 'State Bank of India',
        upiId: 'dinesh.patel@oksbi',
      },
      emergencyContact: { name: 'Manoj Patel', phone: '9876543210', relation: 'Brother' },
    },
    {
      phone: '9999900008',
      name: 'Rakesh Kumar Bind',
      email: 'rakesh.bind@localhaat.in',
      villageName: 'Maner Sharif & Danapur Hub',
      hubCode: 'VH-BR-0108',
      servingVillages: ['Maner', 'Danapur', 'Bihta', 'Sherpur'],
      addressLine: 'Station Road, Opp Post Office',
      villageOrCity: 'Danapur',
      district: 'Patna',
      state: 'Bihar',
      pincode: '801503',
      status: 'ACTIVE',
      operationalStatus: 'ON_DELIVERY',
      verificationStatus: 'VERIFIED',
      isOnline: true,
      rating: 4.88,
      totalDelivered: 178,
      cashInHand: 2800,
      commissionPerDelivery: 28,
      workingHours: '08:00 AM - 07:30 PM',
      liveLocation: { latitude: 25.6186, longitude: 85.0442, updatedAt: new Date(), isSharing: true },
      bankDetails: {
        accountHolder: 'Rakesh Kumar Bind',
        accountNumber: '629182736412',
        ifscCode: 'PUNB0291800',
        bankName: 'Punjab National Bank',
        upiId: 'rakeshbind@paytm',
      },
      emergencyContact: { name: 'Anita Devi', phone: '9876501928', relation: 'Spouse' },
    },
    {
      phone: '9999900014',
      name: 'Amit Sharma',
      email: 'amit.sharma@localhaat.in',
      villageName: 'Chunar Fort Rural Center',
      hubCode: 'VH-UP-0055',
      servingVillages: ['Chunar', 'Adalhat', 'Narayanpur', 'Kachhawa Bazar'],
      addressLine: 'Near Ganga Ghat Road',
      villageOrCity: 'Chunar',
      district: 'Mirzapur',
      state: 'Uttar Pradesh',
      pincode: '231304',
      status: 'ACTIVE',
      operationalStatus: 'WAITING',
      verificationStatus: 'PENDING',
      isOnline: true,
      rating: 4.7,
      totalDelivered: 42,
      cashInHand: 650,
      commissionPerDelivery: 25,
      workingHours: '08:30 AM - 06:30 PM',
      liveLocation: { latitude: 25.1264, longitude: 82.8767, updatedAt: new Date(), isSharing: true },
      bankDetails: {
        accountHolder: 'Amit Sharma',
        accountNumber: '918273645019',
        ifscCode: 'BARB0CHUNAR',
        bankName: 'Bank of Baroda',
        upiId: 'amit.chunar@okaxis',
      },
      emergencyContact: { name: 'Radhe Shyam Sharma', phone: '9450192837', relation: 'Father' },
    },
    {
      phone: '9999900015',
      name: 'Vinod Maurya',
      email: 'vinod.maurya@localhaat.in',
      villageName: 'Bhadohi Carpet Weavers Hub',
      hubCode: 'VH-UP-0072',
      servingVillages: ['Gopiganj', 'Khamaria', 'Suriyawan', 'Gyanpur'],
      addressLine: 'Carpet City Road, Shop 14',
      villageOrCity: 'Bhadohi',
      district: 'Bhadohi',
      state: 'Uttar Pradesh',
      pincode: '221401',
      status: 'SUSPENDED',
      operationalStatus: 'SUSPENDED',
      verificationStatus: 'VERIFIED',
      isOnline: false,
      rating: 4.35,
      totalDelivered: 89,
      cashInHand: 4200,
      commissionPerDelivery: 25,
      workingHours: '09:00 AM - 06:00 PM',
      suspensionReason: 'Customer reported frequent delays in parcel handover and unverified OTP entry attempts.',
      suspensionDuration: '7 Days',
      suspensionEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      liveLocation: { latitude: 25.3944, longitude: 82.5706, updatedAt: new Date(), isSharing: false },
      bankDetails: {
        accountHolder: 'Vinod Maurya',
        accountNumber: '482910293847',
        ifscCode: 'UBIN0548291',
        bankName: 'Union Bank of India',
        upiId: 'vinodmaurya@ybl',
      },
    },
    {
      phone: '9999900016',
      name: 'Sanjay Jha',
      email: 'sanjay.jha@localhaat.in',
      villageName: 'Muzaffarpur Litchi Corridor Hub',
      hubCode: 'VH-BR-0210',
      servingVillages: ['Kanti', 'Motipur', 'Saraiya', 'Barauni Outer'],
      addressLine: 'NH-28 Bypass Crossing',
      villageOrCity: 'Muzaffarpur',
      district: 'Muzaffarpur',
      state: 'Bihar',
      pincode: '842001',
      status: 'OFFLINE',
      operationalStatus: 'OFFLINE',
      verificationStatus: 'VERIFIED',
      isOnline: false,
      rating: 4.92,
      totalDelivered: 146,
      cashInHand: 920,
      commissionPerDelivery: 25,
      workingHours: '08:00 AM - 07:00 PM',
      liveLocation: { latitude: 26.1209, longitude: 85.3647, updatedAt: new Date(), isSharing: false },
    },
    {
      phone: '9999900017',
      name: 'Rajesh Yadav',
      email: 'rajesh.yadav@localhaat.in',
      villageName: 'Ghazipur Rural Junction',
      hubCode: 'VH-UP-0088',
      servingVillages: ['Zamania', 'Saidpur', 'Mohammadabad', 'Dildarnagar'],
      addressLine: 'Lanka Chauraha, Haat Compound',
      villageOrCity: 'Ghazipur',
      district: 'Ghazipur',
      state: 'Uttar Pradesh',
      pincode: '233001',
      status: 'BLOCKED',
      operationalStatus: 'BLOCKED',
      verificationStatus: 'VERIFIED',
      isOnline: false,
      rating: 3.8,
      totalDelivered: 54,
      cashInHand: 5100,
      commissionPerDelivery: 25,
      workingHours: '08:00 AM - 05:00 PM',
      blockedReason: 'Repeated non-deposit of COD cash collected over ₹5,000 threshold without explanation.',
      liveLocation: { latitude: 25.5861, longitude: 83.5772, updatedAt: new Date(), isSharing: false },
    },
  ];

  for (const prof of agentProfiles) {
    let user = await User.findOne({ phone: prof.phone });
    if (!user) {
      user = await User.create({
        name: prof.name,
        phone: prof.phone,
        email: prof.email,
        role: 'village_agent',
        isActive: prof.status === 'ACTIVE' || prof.status === 'OFFLINE',
        kycStatus: prof.verificationStatus === 'VERIFIED' ? 'verified' : 'pending',
        defaultLocation: {
          addressLine: prof.addressLine,
          villageOrCity: prof.villageOrCity,
          district: prof.district,
          state: prof.state,
          pincode: prof.pincode,
        },
      });
    }

    let agent = await VillageAgent.findOne({ hubCode: prof.hubCode });
    if (!agent) {
      agent = await VillageAgent.create({
        userId: user._id,
        villageName: prof.villageName,
        hubCode: prof.hubCode,
        servingVillages: prof.servingVillages,
        hubAddress: user.defaultLocation!,
        commissionPerDelivery: prof.commissionPerDelivery,
        cashInHand: prof.cashInHand,
        isAvailable: prof.status === 'ACTIVE',
        isOnline: prof.isOnline,
        rating: prof.rating,
        totalDelivered: prof.totalDelivered,
        workingHours: prof.workingHours,
        status: prof.status as any,
        operationalStatus: prof.operationalStatus as any,
        verificationStatus: prof.verificationStatus as any,
        suspensionReason: prof.suspensionReason,
        suspensionDuration: prof.suspensionDuration,
        suspensionEndDate: prof.suspensionEndDate,
        blockedReason: prof.blockedReason,
        liveLocation: prof.liveLocation,
        bankDetails: prof.bankDetails,
        emergencyContact: prof.emergencyContact,
      });
      user.villageAgentId = agent._id as any;
      await user.save();
    } else {
      // update status fields
      agent.status = prof.status as any;
      agent.operationalStatus = prof.operationalStatus as any;
      agent.verificationStatus = prof.verificationStatus as any;
      agent.isOnline = prof.isOnline;
      agent.rating = prof.rating;
      agent.cashInHand = prof.cashInHand;
      agent.liveLocation = prof.liveLocation as any;
      agent.bankDetails = prof.bankDetails as any;
      agent.emergencyContact = prof.emergencyContact as any;
      if (prof.suspensionReason) agent.suspensionReason = prof.suspensionReason;
      if (prof.suspensionDuration) agent.suspensionDuration = prof.suspensionDuration;
      if (prof.suspensionEndDate) agent.suspensionEndDate = prof.suspensionEndDate;
      if (prof.blockedReason) agent.blockedReason = prof.blockedReason;
      await agent.save();
    }

    // Seed KYC documents if not present
    const existingKyc = await KycDocument.countDocuments({ userId: user._id });
    if (existingKyc === 0) {
      await KycDocument.create([
        {
          userId: user._id,
          documentType: 'AADHAAR',
          documentNumber: `XXXX-XXXX-${prof.phone.slice(-4)}`,
          documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
          verificationStatus: prof.verificationStatus === 'VERIFIED' ? 'VERIFIED' : 'PENDING',
          verifiedBy: prof.verificationStatus === 'VERIFIED' ? admin._id : undefined,
          verifiedAt: prof.verificationStatus === 'VERIFIED' ? new Date() : undefined,
        },
        {
          userId: user._id,
          documentType: 'PAN',
          documentNumber: `ABCDE${prof.phone.slice(-4)}F`,
          documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
          verificationStatus: prof.verificationStatus === 'VERIFIED' ? 'VERIFIED' : 'PENDING',
          verifiedBy: prof.verificationStatus === 'VERIFIED' ? admin._id : undefined,
          verifiedAt: prof.verificationStatus === 'VERIFIED' ? new Date() : undefined,
        },
      ]);
    }

    // Seed Earnings if none
    const existingEarnings = await Earning.countDocuments({ actorId: user._id, actorType: 'AGENT' });
    if (existingEarnings === 0) {
      await Earning.create([
        {
          actorType: 'AGENT',
          actorId: user._id,
          referenceType: 'PARCEL',
          referenceId: `PARCEL-REF-${agent.hubCode}-01`,
          baseAmount: prof.commissionPerDelivery,
          bonus: 5,
          deduction: 0,
          netAmount: prof.commissionPerDelivery + 5,
          status: 'available',
          remarks: 'Successful rural doorstep handover',
        },
        {
          actorType: 'AGENT',
          actorId: user._id,
          referenceType: 'PARCEL',
          referenceId: `PARCEL-REF-${agent.hubCode}-02`,
          baseAmount: prof.commissionPerDelivery,
          bonus: 0,
          deduction: 0,
          netAmount: prof.commissionPerDelivery,
          status: 'paid',
          remarks: 'Village hub storage fee compensation',
          clearedAt: new Date(),
        },
      ]);
    }

    // Seed Payout if none
    const existingPayouts = await Payout.countDocuments({ actorId: user._id, actorType: 'AGENT' });
    if (existingPayouts === 0) {
      await Payout.create({
        actorType: 'AGENT',
        actorId: user._id,
        amount: 850,
        paymentMode: 'UPI',
        beneficiaryDetails: {
          upiId: prof.bankDetails?.upiId || `${prof.phone}@upi`,
          accountName: prof.name,
        },
        status: prof.status === 'ACTIVE' ? 'pending' : 'processed',
        transactionRef: prof.status !== 'ACTIVE' ? `TXN-REF-${agent.hubCode}` : undefined,
        requestedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        processedAt: prof.status !== 'ACTIVE' ? new Date() : undefined,
      });
    }

    // Seed Reviews if none
    const existingReviews = await AgentReview.countDocuments({ agentId: agent._id });
    if (existingReviews === 0) {
      await AgentReview.create([
        {
          agentId: agent._id,
          customerId: customer1._id,
          rating: 5,
          comment: 'Very polite agent! Delivered directly to our house in the evening without extra charges.',
          status: 'APPROVED',
        },
        {
          agentId: agent._id,
          customerId: customer2._id,
          rating: 4,
          comment: 'Package was handled safely. Kept at hub securely for 1 day until I could pick it up.',
          status: 'APPROVED',
        },
      ]);
    }

    // Seed Complaint for the suspended agent or random
    const existingComplaints = await AgentComplaint.countDocuments({ agentId: agent._id });
    if (existingComplaints === 0 && (prof.status === 'SUSPENDED' || prof.status === 'BLOCKED')) {
      await AgentComplaint.create({
        ticketNumber: `TKT-${agent.hubCode}-${Math.floor(1000 + Math.random() * 9000)}`,
        agentId: agent._id,
        customerId: customer1._id,
        category: prof.status === 'SUSPENDED' ? 'DELAY' : 'OVERCHARGED',
        priority: 'HIGH',
        subject: prof.status === 'SUSPENDED' ? 'Delayed delivery by 2 days' : 'Refusal of cash handover receipt',
        description:
          prof.status === 'SUSPENDED'
            ? 'Agent was not available at hub during promised evening pickup hours.'
            : 'Agent demanded cash payment without updating mobile app confirmation.',
        status: 'OPEN',
      });
    }

    // Seed Activity log
    await AgentActivity.create({
      agentId: agent._id,
      userId: user._id,
      activityType: prof.isOnline ? 'LOGIN' : 'LOGOUT',
      title: prof.isOnline ? 'Agent Hub Opened & Available' : 'Agent Shift Ended',
      description: `Operational status set to ${prof.operationalStatus}`,
      location: prof.liveLocation ? { latitude: prof.liveLocation.latitude, longitude: prof.liveLocation.longitude } : undefined,
    });
  }

  console.log('[SeedAgents] Village Agents ecosystem successfully enriched!');
};

// Auto run if executed directly
if (process.argv[1]?.includes('seedAgentsData')) {
  seedRichAgents().then(() => {
    console.log('Done');
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
