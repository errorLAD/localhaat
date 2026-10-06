import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/localhaat';

async function main() {
  console.log('[Script] Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db!;

  const adminEmail = 'gokul@localhaat.in';
  const rawPassword = 'gokul@1996';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  // 1. Check if an admin exists
  const existingAdmin = await db.collection('users').findOne({ role: 'admin' });

  if (existingAdmin) {
    const updateResult = await db.collection('users').updateOne(
      { _id: existingAdmin._id },
      {
        $set: {
          name: 'Gokul (Admin)',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
          isActive: true,
          kycStatus: 'verified',
        },
      }
    );
    console.log(`[Script] Updated existing admin (${existingAdmin._id}) -> email: ${adminEmail}, name: Gokul (Admin)`);
  } else {
    const insertResult = await db.collection('users').insertOne({
      name: 'Gokul (Admin)',
      phone: '9999900001',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      kycStatus: 'verified',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`[Script] Created new admin (${insertResult.insertedId}) -> email: ${adminEmail}`);
  }

  // 2. Also update customer account 8375007409 password to match if it exists
  await db.collection('users').updateMany(
    { phone: '8375007409' },
    { $set: { password: hashedPassword } }
  );

  // 3. Verify
  const adminDoc = await db.collection('users').findOne({ email: adminEmail });
  if (adminDoc) {
    const isPasswordValid = await bcrypt.compare(rawPassword, adminDoc.password);
    console.log('[Script] Verification successful!');
    console.log({
      id: adminDoc._id,
      name: adminDoc.name,
      email: adminDoc.email,
      phone: adminDoc.phone,
      role: adminDoc.role,
      passwordVerified: isPasswordValid,
    });
  } else {
    console.error('[Script] Error: Admin doc could not be found after update!');
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('[Script] Failed:', err);
  process.exit(1);
});
