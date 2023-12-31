
const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    name:{ type: String},
    description:{ type: String, },
    imageUrl: [{ type: String}],
    publish: {
      type: Boolean,
    },
},
{
  timestamps: true
});

const BannerSchema = mongoose.model('Banner', bannerSchema);

module.exports = BannerSchema;
