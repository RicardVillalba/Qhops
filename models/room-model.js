const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// CREATE SCHEMA
const roomSchema = new Schema({
    name: { type: String, required: true },
    description: String,
    numSpots: Number,
    queues: [{ type: Schema.Types.ObjectId, ref: "Queue" }],
    spotsOccupied: [{ type: Schema.Types.ObjectId, ref: "Appointment" }],
});

// CREATE MODEL
//                            rooms
const Room = mongoose.model('Room', roomSchema);

// EXPORT
module.exports = Room;