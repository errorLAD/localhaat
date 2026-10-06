import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Earning } from '../models/Earning.js';
import { Payout } from '../models/Payout.js';

export const getMyEarnings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const earnings = await Earning.find({ actorId: req.user._id }).sort({ createdAt: -1 });

    const totalEarned = earnings.reduce((sum, e) => sum + e.netAmount, 0);
    const availableBalance = earnings
      .filter((e) => e.status === 'available')
      .reduce((sum, e) => sum + e.netAmount, 0);

    const payouts = await Payout.find({ actorId: req.user._id }).sort({ requestedAt: -1 });

    return res.status(200).json({
      success: true,
      stats: {
        totalEarned,
        availableBalance,
        totalPayoutsRequested: payouts.reduce((sum, p) => sum + p.amount, 0),
      },
      earnings,
      payouts,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const requestPayout = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { amount, paymentMode = 'UPI', beneficiaryDetails } = req.body;
    if (!amount || amount < 100) {
      return res.status(400).json({ success: false, message: 'Minimum payout withdrawal is ₹100.' });
    }

    // Check available balance
    const availableEarnings = await Earning.find({ actorId: req.user._id, status: 'available' });
    const availableBalance = availableEarnings.reduce((sum, e) => sum + e.netAmount, 0);

    if (availableBalance < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient available balance. You have ₹${availableBalance}, requested ₹${amount}`,
      });
    }

    const actorType = req.user.role === 'logistics_partner' ? 'PARTNER' : req.user.role === 'village_agent' ? 'AGENT' : 'SELLER';

    const payout = await Payout.create({
      actorType,
      actorId: req.user._id,
      amount: Number(amount),
      paymentMode,
      beneficiaryDetails: beneficiaryDetails || { upiId: `${req.user.phone}@upi` },
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Payout withdrawal request submitted successfully.',
      payout,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
