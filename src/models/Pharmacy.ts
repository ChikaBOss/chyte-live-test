import mongoose, {
  Schema,
  model,
  models,
  Document,
  Types,
} from "mongoose";

/* =========================
   Sub-document Types
========================= */

interface BusinessHour {
  day?: string;
  open?: boolean;
  openingTime?: string;
  closingTime?: string;
}

interface PharmacyDocumentFile {
  name?: string;
  type?: string;
  url?: string;
  publicId?: string;
}

/* =========================
   MAIN PHARMACY DOCUMENT
========================= */

export interface PharmacyDocument extends Document {
  pharmacyName: string;
  ownerName: string;
  email: string;
  phone?: string;

  pickupZone: string;
  pickupAddress?: string;
  pickupPhone: string;

  password?: string;

  logoUrl?: string;
  bio?: string;
  category?: string;
  minOrder?: number;

  businessHours: BusinessHour[];

  approved: boolean;
  role: string;

  documents: PharmacyDocumentFile[];

  createdAt: Date;
  updatedAt: Date;
}

/* =========================
   SCHEMAS
========================= */

const BusinessHourSchema = new Schema<BusinessHour>(
  {
    day: String,
    open: Boolean,
    openingTime: String,
    closingTime: String,
  },
  { _id: false }
);

const DocumentSchema = new Schema<PharmacyDocumentFile>(
  {
    name: String,
    type: String,
    url: String,
    publicId: String,
  },
  { _id: false }
);

const PharmacySchema = new Schema<PharmacyDocument>(
  {
    pharmacyName: { type: String, required: true },
    ownerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,

    pickupZone: { type: String, required: true },
    pickupAddress: String,
    pickupPhone: { type: String, required: true },

    password: String,

    logoUrl: String,
    bio: String,
    category: String,
    minOrder: Number,

    businessHours: {
      type: [BusinessHourSchema],
      default: [],
    },

    approved: { type: Boolean, default: false },
    role: { type: String, default: "pharmacy" },

    documents: {
      type: [DocumentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

/* =========================
   MODEL EXPORT
========================= */

const Pharmacy =
  models.Pharmacy ||
  model<PharmacyDocument>("Pharmacy", PharmacySchema);

export default Pharmacy;