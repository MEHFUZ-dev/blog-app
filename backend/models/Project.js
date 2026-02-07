const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: String,
  tech: String,
  image: String
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
