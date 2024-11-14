const mongoose = require('mongoose');

const WebhookSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  sourceType: { type: String, required: true }, // e.g., email, discord, etc.
  destinationType: { type: String, required: true }, // e.g., discord, slack, etc.
  sourceConfig: { type: mongoose.Schema.Types.Mixed, required: true },
  destinationConfig: { type: mongoose.Schema.Types.Mixed, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastUsed: { type: Date },
  totalProcessed: { type: Number, default: 0 }
});

module.exports = mongoose.model('Webhook', WebhookSchema);
