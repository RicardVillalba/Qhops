const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// CREATE SCHEMA
const queueSchema = new Schema({
    appointments: [{ type: Schema.Types.ObjectId, ref: "Appointment" }],
    inProgress: [{ type: Schema.Types.ObjectId, ref: "Appointment" }],
    appointments_done: [{ type: Schema.Types.ObjectId, ref: "Appointment" }],
    nurseId: Schema.Types.ObjectId,
    date: Date,
    capacity: Number, //      ( numSpots*workingHours )
    patientsServed: { type: Number, default: 0 },
    avgTime: { type: Number, default: 0 },
    totalTime: { type: Number, default: 0 } //   ( timepast / patients_Served )
});
// CREATE MODEL
//                            queues
const Queue = mongoose.model('Queue', queueSchema);

// EXPORT
module.exports = Queue;