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
console.log(todayString);
let todayQueue = Queue.find({ date: { $gte: todayString } })

// Middleware function - checks if there is aQueue{} for today 
// if it doesnt exists it creates one.
const queueObj = {
    appointments: [],
    inProgress: [],
    appointments_done: [],
    roomId: '1',
    nurseId: undefined,
    date: new Date(),
    capacity: '', //      ( numSpots*workingHours )
    patientsServed: '',
    avgTime: '', //   ( timepast / patients_Served )
}
// how to avoid runing this function every time we enter dashboard?
function isQueue(req, res, next) {
    const todayQueue = Queue.find({ date: { $gte: todayString } })
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
siteRouter.get('/dashboard', isLoggedIn, isQueue, (req, res, next) => {

    todayQueue.populate('appointments inProgress appointments_done')
        .then((queue) => {
            // console.log(queue);

            // console.log(queue[0].appointments[0].code);
            // console.log(appointment[0].tags);

            res.render('dashboard', { queue: queue })
        })
        .catch((err) => next(err));
});

// ACCES ADD APPOINTMENT FORM

// GET         '/add-appointment'       
siteRouter.get('/add-appointment', isLoggedIn, isQueue, (req, res, next) => {
    res.render('add-appointment');
})

// ADD APPOINTMENT
// POST         '/add/:id'       
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
                console.log(appointment._id);

                // 3. push the appointment _id into Queue deppending of the status

                // push the appointment _id into queue.appointments[]

                if (appointment.status === 'waiting') {
                    Queue.find({ date: { $gte: todayString } })
                        .then((queue) => {
                            // console.log(queue[0].appointments);
                            let appointmentsArray = queue[0].appointments
                            // console.log(appointmentsArray);
                            appointmentsArray.push(appointment._id)
                            // console.log(appointmentsArray);

                            return Queue.findByIdAndUpdate(queue[0]._id, { appointments: appointmentsArray })
                        })
                        .then((queue) => console.log(queue))
                        .catch((err) => next(err));
                }

                else if (appointment.status === 'attending') {

                    // push the appointment _id into queue.inProgress[]
                    Queue.find({ date: { $gte: todayString } })
                        .then((queue) => {
                            // console.log(queue[0].inProgress);
                            let inProgressArray = queue[0].inProgress
                            // console.log(inProgressArray);
                            inProgressArray.push(appointment._id)
                            // console.log(inProgressArray);

                            return Queue.findByIdAndUpdate(queue[0]._id, { inProgress: inProgressArray })
                        })
                        .then((queue) => console.log(queue))
                        .catch((err) => next(err));


                }
                else if (appointment.status === 'attended') {

                    // push the appointment _id into queue.appointments_done[]
                    Queue.find({ date: { $gte: todayString } })
                        .then((queue) => {
                            // console.log(queue[0].appointments_done);
                            let appointments_doneArray = queue[0].appointments_done
                            // console.log(appointments_doneArray);
                            appointments_doneArray.push(appointment._id)
                            // console.log(appointments_doneArray);

                            return Queue.findByIdAndUpdate(queue[0]._id, { appointments_done: appointments_doneArray })
                        })
                        .then((queue) => console.log(queue))
                        .catch((err) => next(err));
                }

                // 4. When the appointment is created, redirect (we choose - add form)
                res.redirect("add-appointment");
            })
            .catch((err) => {
                res.render("add-appointment", {
                    errorMessage: `Error during add appointment`,
                });

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
                    function arrayDel(appointment) {
                        return appointment != id
                    }
                    // console.log(typeof appointment._id, appointment._id);
                    // console.log(typeof appointment._id != id);
                    // console.log(typeof id, id);

                    let updatedAppointmentsArray = queue.appointments.filter(arrayDel);
                    console.log('updatedAppointmentsArray :>> ', updatedAppointmentsArray);
                    return Queue.findByIdAndUpdate(queue._id, { appointments: updatedAppointmentsArray })
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

// DELETE APPOINTMENT
// get         '/dashboard/delete/:id'       
siteRouter.get('/dashboard/delete/:id', isLoggedIn, (req, res, next) => {
    const { id } = req.params;

    // 1. Search  appointment in AppointmentsDB to be deleted.
    Appointment.findByIdAndRemove(id)
        .then((appointment) => {

            // 2. Search in Queue model the appointment by id in the inProgress Array to deleted it.

            // Queue.find({ date: { $gte: todayString } })
            //     .then((queue) => {
            //         const todayQ = queue[0]
            //         console.log('todayQ :>> ', todayQ);

            //         // transform the string `id` in an ObjectId
            //         idObj = mongoose.Types.ObjectId(id)
            //         // find and delete the appointment.
            //         return Queue.findOne({ 'inProgress': idObj })
            //     })
            //     .then((data) => {
            //         console.log(data)
            res.redirect("/dashboard");
            //     })
            // .catch((err) => {
            //     res.render("/dashboard", { errorMessage: `Error during delete appointment` });

            //     // function arrayDel(appointment) {
            //     //     return appointment != id
            //     // }
            //     // // console.log(typeof appointment._id, appointment._id);
            //     // // console.log(typeof appointment._id != id);
            //     // // console.log(typeof id, id);

            //     // let updatedAppointmentsArray = queue.appointments.filter(arrayDel);
            //     // console.log('updatedAppointmentsArray :>> ', updatedAppointmentsArray);
            //     // return Queue.findByIdAndUpdate(queue._id, { appointments: updatedAppointmentsArray })

            // })

            // 6. When the appointment is created, redirect (we choose - add form)
        })
        .catch((err) => {
            res.render("/dashboard", { errorMessage: `Error during delete appointment` });
        });
})

// UPDATE APPOINTMENT, CHANGE STATUS TO ATTENDING (TO DONE QUEUE)
// GET         '/dashboard/done/:id'       
siteRouter.get('/dashboard/done/:id', isLoggedIn, (req, res, next) => {
    const { id } = req.params;

    // 1. Search  appointment in DB to change status.
    Appointment.findByIdAndUpdate(id, { status: 'attended' })
        .then((appointment) => {
            // console.log(appointment);

            return appointment
        })
        .then((appointment) => {
            // console.log(appointment)
            // push the appointment _id into queue.appointments_done[]
            Queue.find({ date: { $gte: todayString } })
                .then((queue) => {
                    const todayQ = queue[0]
                    // console.log(todayQ.inProgress);
                    let appointments_doneArray = todayQ.appointments_done
                    // console.log(appointments_doneArray);
                    appointments_doneArray.push(appointment._id)
                    // console.log(appointments_doneArray);

                    return Queue.findByIdAndUpdate(todayQ._id, { appointments_done: appointments_doneArray })

                }) // update the appointments array to remove the moved appointment
                .then((queue) => {
                    console.log('queue after update :>> ', queue);
                    function arrayDel(appointment) {
                        return appointment != id
                    }
                    // console.log(typeof appointment._id, appointment._id);
                    // console.log(typeof appointment._id != id);
                    // console.log(typeof id, id);

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





module.exports = siteRouter;