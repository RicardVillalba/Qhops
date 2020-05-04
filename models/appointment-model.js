const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// CREATE SCHEMA
const appointmentSchema = new Schema({
    code: { type: String, required: true },
    fName: { type: String, required: true },
    lName: { type: String, required: true },
    tags: [String],
    email: { type: String, required: true },
    isUrgent: Boolean,
    status: {
        type: String,
        enum: ["waiting", "attending", "attended"],
        appointment_start_At: Date,
        appointment_finished_At: Date,
        required: true
    },
    room: { type: Schema.Types.ObjectId, ref: "Room" }
});

// CREATE MODEL
//                                     Appointments
const Appointment = mongoose.model('Appointment', appointmentSchema);

// EXPORT
module.exports = Appointment;