var mongoose = require('mongoose');

var DomicilioSchema = new mongoose.Schema({
  V0001: Number,
  V0002: Number,
  V0011: Number,
  V0300: Number,
  V0010: Number,
  V1001: Number,
  V1002: Number,
});

module.exports = mongoose.model('Domicilio', DomicilioSchema);
