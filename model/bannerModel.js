
const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    name:{ type: String},
    description:{ type: String, },
    imageUrl: [{ type: String}],
    status: {
      type: String,
      enum: ["publish", "unpublish", ],
      default: "unpublish",
    },
},
{
  timestamps: true
});

const BannerSchema = mongoose.model('Banner', bannerSchema);

module.exports = BannerSchema;
