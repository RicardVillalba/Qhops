const express = require('express');
const siteRouter = express.Router();
const Appointment = require("./../models/appointment-model");
const TokenGenerator = require('tokgen');
let token = new TokenGenerator();
const Queue = require('./../models/queue-model')
const Admin = require('./../models/admin-model')

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let today = new Date()
let todayString = today.toLocaleDateString()
console.log(todayString, today);
let todayQueue = Queue.find({ date: { $gte: today } }) //comment with Uros why the date doesn't resolve properly

// Middleware function - checks if there is aQueue{} for today 
// if it doesnt exists it creates one.
const queueObj = {
    appointments: [],
    inProgress: [],
    appointments_done: [],
    nurseId: undefined,
    date: new Date(),
    capacity: '', //      ( numSpots*workingHours )
    patientsServed: '',
    avgTime: '', //   ( timepast / patients_Served )
}

// how to avoid runing this function every time we enter dashboard?
function isQueue(req, res, next) {
    const todayQueue = Queue.find({ date: { $gte: today } })
        .then((queue) => {
            // console.log('queue :>> ', queue[0]);
            if (queue[0]) {
                next()
            } else {
                const createdQ = Queue.create(queueObj)
                    .then((createdQ) => {
                        console.log(createdQ);
                        next()
                    })
            }
        })
}


// Middleware function - checks if the user is authenticated
function isLoggedIn(req, res, next) {
    if (req.session.currentUser) { // If user is authenticated
        next();
    } else {
        res.redirect('auth/login');
    }
}

// ACCESS DASHBOARD
// GET         '/dashboard'       
siteRouter.get('/dashboard', isLoggedIn, (req, res, next) => {
    var start = new Date();
    start.setHours(0, 0, 0, 0);

    var end = new Date();
    end.setHours(23, 59, 59, 999);

    Queue.find({ date: { $gte: start, $lte: end } }) //comment with Uros why the date doesn't resolve properly
        .populate('appointments inProgress appointments_done')
        .then((queue) => {
            if (queue[0]) {
                // res.render('dashboard', { queue: queue })
                return queue
            } else {
                return Queue.create(queueObj)
            }

        })
        .then((createdQ) => {
            res.render('dashboard', { queue: createdQ })
        })
        .catch((err) => next(err));
});

// ACCES ADD APPOINTMENT FORM

// GET         '/add-appointment'       
siteRouter.get('/add-appointment', isLoggedIn, (req, res, next) => {
    res.render('add-appointment');
})

// ADD APPOINTMENT
// POST         '/appointment'       
siteRouter.post('/add-appointment', isLoggedIn, (req, res, next) => {
    const { fName, lName, email, tagsList, isUrgent, status } = req.body;

    // 1. Check if the required fields are provided
    if (email === "" || fName === "" || lName === "" || status === "") {
        res.render("add-appointment", {
            errorMessage: "Please fill all the required fields.",
        });
        return; // stops the execution of the function further
    }

    // create random code
    token.generate(8, (error, code) => { // => 'sySbqK9N'
        if (error) {
            return next(error)
        }

        // 2. Create new appointment in DB, saving the given fields.

        console.log('values to dB--->', code, fName, lName, email, tagsList, isUrgent, status);

        // to create an array out of the tags string:
        const tags = req.body.tagsList.split(" ")
        console.log(tags);
        //console.log(todayQueue);


        Appointment.create({ code, fName, lName, email, tags, isUrgent, status })
            .then((appointment) => {

                // 3. push the appointment _id into Queue deppending of the status

                // push the appointment _id into queue.appointments[]


                function addAppointmentToQueue(responseObj, appointmentObj) {
                    const appointmentTypes = {
                        waiting: "appointments",
                        attending: "inProgress",
                        attended: "appointments_done"
                    }
                    const { status } = appointmentObj; // 'waiting', 'attending', 'attended'
                    const typeOfQueue = appointmentTypes[status]; // appointmentTypes['waiting']
                    // appointmentTypes['waiting'] --> typeOfQueue = 'appointments'
                    // appointmentTypes['attending'] --> typeOfQueue = 'inProgress'
                    // appointmentTypes['attended'] --> typeOfQueue = 'appointments_done'

                    var start = new Date();
                    start.setHours(0, 0, 0, 0);

                    var end = new Date();
                    end.setHours(23, 59, 59, 999);

                    console.log('from :>> ', start);
                    console.log('to :>> ', end);

                    Queue.find({ date: { $gte: start, $lte: end } })
                        .then((queue) => {
                            if (queue[0]) { // If the queue exist add appointment id to the corresponding array
                                let appointmentsArray = queue[0][typeOfQueue]
                                // queue[0].appointments
                                appointmentsArray.push(appointmentObj._id)

                                return Queue.findByIdAndUpdate(queue[0]._id, { [typeOfQueue]: appointmentsArray })

                            } else { // Else create queue and then add appointment id to the corresponding array
                                const newQueue = { ...queueObj, [typeOfQueue]: [appointmentObj._id] }
                                return Queue.create(newQueue);
                            }
                        })
                        .then((queue) => {
                            // 4. When the appointment is created, redirect (we choose - add form)
                            responseObj.redirect("add-appointment");
                        })
                        .catch((err) => next(err));
                }

                addAppointmentToQueue(res, appointment)
            })
            .catch((err) => {
                res.render("add-appointment", { errorMessage: `Error during add appointment` });
            });
    });
})


// UPDATE APPOINTMENT, CHANGE STATUS TO ATTENDING (TO ROOM QUEUE)
// GET         '/dashboard/to_room/:id'       
siteRouter.get('/dashboard/to_room/:id', isLoggedIn, (req, res, next) => {
    const { id } = req.params;

    // 1. Search  appointment in DB to change status.
    Appointment.findByIdAndUpdate(id, { status: 'attending' })
        .then((appointment) => {
            // console.log(appointment);

            return appointment
        })
        .then((appointment) => {
            // console.log(appointment)
            // push the appointment _id into queue.inProgress[]
            Queue.find({ date: { $gte: todayString } })
                .then((queue) => {
                    const todayQ = queue[0]
                    // console.log(todayQ.inProgress);
                    let inProgressArray = todayQ.inProgress
                    // console.log(inProgressArray);
                    inProgressArray.push(appointment._id)
                    // console.log(inProgressArray);

                    return Queue.findByIdAndUpdate(todayQ._id, { inProgress: inProgressArray })

                }) // update the appointments array to remove the moved appointment
                .then((queue) => {
                    console.log('queue after update :>> ', queue);
                    return Queue.findByIdAndUpdate(queue._id, { $pull: { appointments: id } })

                })
                // 2. When the appointment is updated, redirect
                .then((data) => res.redirect("/dashboard"))
                .catch((err) => next(err));
        })
        .catch((err) => {
            res.render("/dashboard", {
                errorMessage: `Error during appointment status update`,
            });
        });
})

// DELETE APPOINTMENT
// get         '/dashboard/delete/:id/:status'       
siteRouter.get('/dashboard/delete/:id/:status', isLoggedIn, (req, res, next) => {
    const { id, status } = req.params;


    // 1. Search  appointment in AppointmentsDB to be deleted.
    Appointment.findByIdAndRemove(id)
        .then((appointment) => {
            res.redirect("/dashboard");
            return
        })

        // update the appointments array to remove the moved appointment
        .then(() => {

            var start = new Date();
            start.setHours(0, 0, 0, 0);
            var end = new Date();
            end.setHours(23, 59, 59, 999);

            console.log('from :>> ', start);
            console.log('to :>> ', end);

            Queue.find({ date: { $gte: start, $lte: end } })
                .then((queue) => {
                    const appointmentTypes = {
                        waiting: "appointments",
                        attending: "inProgress",
                        attended: "appointments_done"
                    }
                    const typeOfQueue = appointmentTypes[status]; // appointmentTypes['waiting']
                    // appointmentTypes['waiting'] --> typeOfQueue = 'appointments'
                    // appointmentTypes['attending'] --> typeOfQueue = 'inProgress'
                    // appointmentTypes['attended'] --> typeOfQueue = 'appointments_done'

                    // console.log('found queue :>> ', queue);
                    // console.log('found status :>> ', status);
                    // // console.log('found typeOfQueue :>> ', typeOfQueue);
                    // console.log('found id :>> ', id);

                    function arrayDel(appointment) {
                        return appointment != id
                    }

                    queue[0][typeOfQueue] = queue[0][typeOfQueue].filter(arrayDel);
                    return queue[0].save()
                    //return Queue.findByIdAndUpdate(queue[0]._id, { $pull: { typeOfQueue: id } })

                })
                .catch((err) => {
                    res.render("/dashboard", { errorMessage: `Error during delete appointment` });
                })

        })
})



// UPDATE APPOINTMENT, CHANGE STATUS TO ATTENDING (TO DONE QUEUE)
// GET         '/dashboard/done/:id'       
siteRouter.get('/dashboard/done/:id', isLoggedIn, (req, res, next) => {
    const { id } = req.params;

    // 1. Search  appointment in DB to change status.
    Appointment.findByIdAndUpdate(id, { status: 'attended' })
        .then((appointment) => {

            return appointment
        })
        .then((appointment) => {
            // push the appointment _id into queue.appointments_done[]
            Queue.find({ date: { $gte: todayString } })
                .then((queue) => {
                    const todayQ = queue[0]
                    let appointments_doneArray = todayQ.appointments_done
                    appointments_doneArray.push(appointment._id)

                    return Queue.findByIdAndUpdate(todayQ._id, { appointments_done: appointments_doneArray })

                }) // update the appointments array to remove the moved appointment
                .then((queue) => {
                    console.log('queue after update :>> ', queue);
                    function arrayDel(appointment) {
                        return appointment != id
                    }

                    let updatedInProgressArray = queue.inProgress.filter(arrayDel);
                    console.log('updatedinProgressArray :>> ', updatedInProgressArray);
                    return Queue.findByIdAndUpdate(queue._id, { inProgress: updatedInProgressArray })
                })
                .catch((err) => next(err));

            // 2. When the appointment is updated, redirect
            res.redirect("/dashboard");

        })
        .catch((err) => {
            res.render("/dashboard", {
                errorMessage: `Error during appointment status update`,
            });
        });
})

// ACCESS PUBLIC QUEUE
// GET         '/publicQ'       
siteRouter.get('/publicQ', (req, res, next) => {

    todayQueue.populate('appointments inProgress appointments_done')
        .then((queue) => {
            res.render('publicQ', { queue: queue })
        })
        .catch((err) => next(err));
});

// ACCESS PROFILE
// GET         '/profile'       
siteRouter.get('/profile', (req, res, next) => {

    res.render('profile')
})


// POST          '/pastQ'       
siteRouter.post('/pastQ', isLoggedIn, (req, res, next) => {
    const { date } = req.body;
    console.log('date :>> ', date);


    // 1. Check if the required fields are provided
    if (date === "") {
        res.render("/dashboard", { errorMessage: "Please fill all the required fields.", });
        return; // stops the execution of the function further
    }
    // establish date range from 00:00 of the date to the 00:00 of the next day (24h in total)
    let from = new Date(date)
    let to = new Date(date)
    to.setDate(to.getDate() + 1)
    console.log('from :>> ', from);
    console.log('to :>> ', to);

    Queue.find({ date: { $gte: from, $lte: to } }).populate('appointments inProgress appointments_done')
        .then((queue) => {
            console.log(queue);

            // console.log(queue[0].appointments[0].code);
            // console.log(appointment[0].tags);

            res.render('pastQ', { queue: queue })
        })
        .catch((err) => {
            res.render("/dashboard", { errorMessage: `Error during add appointment` });
        })
});


module.exports = siteRouter;