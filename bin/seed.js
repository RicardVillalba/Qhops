const mongoose = require('mongoose');
const Queue = require('./../models/queue-model.js');
const DB_NAME = 'qhopsDB';

let queue = {

    appointments: [],
    inProgress: [],
    appointments_done: [],
    nurseId: '5eaaf29e9f801f3aa609c3dd',
    date: new Date(),
    capacity: 10, //      ( numSpots*workingHours )
    patientsServed: 10,
    avgTime: 3694948, //   ( timepast / patients_Served )

}

mongoose.connect(
    `mongodb://localhost:27017/${DB_NAME}`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
    .then((x) => {
      console.log(`Connected to DB: ${x.connections[0].name}`);
      // 2. CREATE THE DOCUMENT FROM THE ARRAY OF `celebrities`
      const createQ = Queue.create(queue);
      return createQ;
    })
    .then((createdQ) => {
      console.log(`Inserted books: ${createdQ}`)
      // 3. CLOSE THE DB CONNECTION
  
      const closePr = mongoose.connection.close();
      return closePr;
    })
    .then(() => {
      console.log('Closed the DB connection');
    })
    .catch((err) => console.log(err));