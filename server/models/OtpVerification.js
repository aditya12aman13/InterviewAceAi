const mongoose = require("mongoose");

const otpVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      default: "registration",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // TTL index: automatically deleted from MongoDB after 600s (10 mins)
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OtpVerification", otpVerificationSchema);
