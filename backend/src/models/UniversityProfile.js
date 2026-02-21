const mongoose = require('mongoose');

const savedFilterSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: 'Untitled filter' },
    filters: { type: mongoose.Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const universityProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    universityName: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    requirements: { type: String, trim: true, default: '' },
    savedFilters: [savedFilterSchema],
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

universityProfileSchema.index({ isVerified: 1 });

module.exports = mongoose.model('UniversityProfile', universityProfileSchema);
