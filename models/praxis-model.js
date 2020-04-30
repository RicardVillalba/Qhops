
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// CREATE SCHEMA
const praxisSchema = new Schema({
    organizationName: String,
    owner: String,
    queues: [{ type: ObjectId, ref: "Q" }]
}
);


// CREATE MODEL
//                             Praxis
const Praxis = mongoose.model('Praxis', praxisSchema);


// EXPORT
module.exports = Praxis;