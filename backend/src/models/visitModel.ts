import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IVisit extends Document {
  ip?: string;
  userId?: mongoose.Types.ObjectId;
  userAgent?: string;
  path?: string;
  createdAt: Date;
}

const visitSchema = new Schema<IVisit>(
  {
    ip: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userAgent: {
      type: String,
    },
    path: {
      type: String, // ví dụ: "/", "/products/123"
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const VisitModel: Model<IVisit> = mongoose.model<IVisit>('Visit', visitSchema);

export default VisitModel;