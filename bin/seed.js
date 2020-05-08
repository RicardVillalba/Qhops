const mongoose = require('mongoose');
const Queue = require('./../models/queue-model.js');
require('dotenv').config()

let queue = {

  appointments: [],
  inProgress: [],
  appointments_done: [],
  nurseId: '5eaaf29e9f801f3aa609c3dd',
  date: new Date(),
  capacity: 10, //      ( numSpots*workingHours )
  //patientsServed: 0,
  //avgTime: 0, //   ( timepast / patients_Served )

}

mongoose.connect(process.env.MONGODB_URI,{ 
  useNewUrlParser: true, useUnifiedTopology: true }
)
  .then((x) => x.connection.dropDatabase())
  .then(() => {
    // 2. CREATE THE DOCUMENT FROM THE OBJ queue
    const createQ = Queue.create(queue);
    return createQ;
  })
  .then((createdQ) => {
    console.log(`Inserted queues: ${createdQ}`)
    // 3. CLOSE THE DB CONNECTION

    const closePr = mongoose.connection.close();
    return closePr;
  })
  .then(() => {
    console.log('Closed the DB connection');
  })
  .catch((err) => console.log(err));