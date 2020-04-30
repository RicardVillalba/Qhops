
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// CREATE SCHEMA
const queueSchema = new Schema({
    appointments: [ {type: ObjectId, ref: "Appointment" } ],
    inProgress: [{type: ObjectId, ref: "Appointment" }],
    appointments_done: [{type: ObjectId, ref: "Appointment" }],
    // roomId: String ????
    nurseId: ObjectId,
    date: Date,
    capacity:  Number, //      ( numSpots*workingHours )
    patientsServed: Number,
    avgTime: Number, //   ( timepast / patients_Served )
    }
);


// CREATE MODEL
//                            queues
const Queue = mongoose.model('Queue', queueSchema);


// EXPORT
module.exports = Queue;