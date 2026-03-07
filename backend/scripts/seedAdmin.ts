import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/userModel';

async function main() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('Missing MONGODB_URI in .env');

    await mongoose.connect(uri);

    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const pass = process.env.ADMIN_PASSWORD || 'admin123';

    let u = await User.findOne({ email });
    if (!u) {
        u = new User({ fullName: 'Administrator', email, role: 'admin', passwordHash: '' });
        await u.setPassword(pass);           // cần method này trong userModel
        await u.save();
        console.log('✅ Seeded admin:', email);
    } else {
        if (u.role !== 'admin') {
            u.role = 'admin';
            await u.save();
            console.log('🔁 Upgraded existing user to admin:', email);
        } else {
            console.log('ℹ️ Admin existed:', email);
        }
    }

    await mongoose.disconnect();
}

main().catch(async (err) => {
    console.error('❌ Seed admin failed:', err);
    try { await mongoose.disconnect(); } catch { }
    process.exit(1);
});
