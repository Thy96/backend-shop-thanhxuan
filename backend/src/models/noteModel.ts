import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { ICategory, IUser } from "../types";

export interface INote extends Document {
  thumbnail: any;
  title: string;
  slug: string;
  content: Object;
  status: string;
  categoryIds: (Types.ObjectId | ICategory)[];
  author: Types.ObjectId | IUser;
  updatedBy: Types.ObjectId | IUser;
  isDeleted: boolean;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>({
  thumbnail: {
    type: String,
    required: false
  },
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: Object,
    required: true
  },
  status: {
    type: String,
    enum: ["draft", "published"],
    default: "draft"
  },
  categoryIds: [{
    type: Schema.Types.ObjectId,
    ref: "NoteCategory",
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null,
  }
}, {
  timestamps: true
});

const NoteModel: Model<INote> = mongoose.model<INote>("Note", noteSchema);
export default NoteModel;