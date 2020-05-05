const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// CREATE SCHEMA
const praxisSchema = new Schema({
    organizationName: String,
    owner: String,
    queues: [{ type: Schema.Types.ObjectId, ref: "Queue" }],
    rooms: [{ type: Schema.Types.ObjectId, ref: "Room" }]
});

// CREATE MODEL
//                             Praxis
const Praxis = mongoose.model('Praxis', praxisSchema);


// EXPORT
module.exports = Praxis;