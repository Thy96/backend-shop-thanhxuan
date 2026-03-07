import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/userModel';

(async () => {
    try {
        const uri = process.env.MONGODB_URI as string;
        await mongoose.connect(uri);

        const email = 'caodinhthy1996@gmail.com';     // đổi nếu cần
        const newPass = '123456789';                   // mật khẩu bạn muốn dùng

        const u = await User.findOne({ email }).select('+passwordHash');
        if (!u) throw new Error('Không tìm thấy user: ' + email);

        await u.setPassword(newPass);
        await u.save();
        console.log('✅ Đặt lại mật khẩu OK cho', email);
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
})();
