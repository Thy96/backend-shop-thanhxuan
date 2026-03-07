import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from 'bcrypt';

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
  EDITOR = 'editor',
}

export interface IUser extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  role: Role;
  phone: string;
  address: string;
  tokenVersion: number;
  setPassword(password: string): Promise<void>;
  verifyPassword(password: string): Promise<boolean>;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  resetPasswordRequestedAt?: Date;
  isBlocked: boolean;
  blockedAt: Date | null;
  isVerified: boolean;
  verifyToken?: string;
  verifyTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  fullName: { type: String, required: false, trim: true },
  email: {
    type: String, unique: true, required: true, lowercase: true, trim: true, validate: {
      validator: (v: string) =>
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(v),
      message: 'Email không hợp lệ',
    },
  },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: Object.values(Role), default: Role.USER },
  phone: { type: String, trim: true, default: '', },
  address: { type: String, trim: true, default: '' },
  tokenVersion: { type: Number, default: 0 },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  resetPasswordRequestedAt: { type: Date },
  isBlocked: { type: Boolean, default: false },
  blockedAt: { type: Date, default: null },
  isVerified: { type: Boolean, default: false },
  verifyToken: { type: String, select: false },
  verifyTokenExpires: { type: Date, select: false },
}, { timestamps: true });

// ✅ set plain password (KHÔNG HASH)
userSchema.methods.setPassword = async function (password: string) {
  this.passwordHash = password;
};

// ✅ hash trước khi save
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();

  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// ✅ verify password
userSchema.methods.verifyPassword = function (password: string) {
  return bcrypt.compare(password, this.passwordHash);
};

const UserModel: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default UserModel;