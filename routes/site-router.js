const express = require('express');
const siteRouter = express.Router();
const Appointment = require("./../models/appointment-model");
const TokenGenerator = require('tokgen');
let token = new TokenGenerator();

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
    res.render('dashboard');
})

// ACCES ADD APPOINTMENT FORM

// GET         '/add-appointment'       
siteRouter.get('/add-appointment', isLoggedIn, (req, res, next) => {
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
    console.log(typeof isUrgent);
    
    console.log('values to dB--->', code, fName, lName, email, tagsList, isUrgent, status);
    
    Appointment.create({ code, fName, lName, email, tagsList, isUrgent, status })
        .then((appointment) => {
            // 6. When the appointment is created, redirect (we choose - add form)
            res.redirect("add-appointment");
        })
        .catch((err) => {
            res.render("add-appointment", {
                errorMessage: `Error during add appointment`,
            });
   
        });
    });
})



// code: String, --> How do we generate the code?


// DELETE APPOINTMENT
// POST         '/dashboard/delete/:id'       
siteRouter.post('/dashboard/delete/:id', isLoggedIn, (req, res, next) => {
    const { id } = req.params;

    // 1. Search  appointment in DB to be deleted.
    Appointment.findByIdAndRemove(id)
        .then((appointment) => {
            // 6. When the appointment is created, redirect (we choose - add form)
            res.redirect("/dashboard");
        })
        .catch((err) => {
            res.render("/dashboard", {
                errorMessage: `Error during delete appointment`,
            });
        });
})


// UPDATE APPOINTMENT, CHANGE STATUS TO ATTENDING (TO ROOM QUEUE)
// POST         '/dashboard/to_room/:id'       
siteRouter.post('/dashboard/to_room/:id', isLoggedIn, (req, res, next) => {
    const { id } = req.params;

    // 1. Search  appointment in DB to change status.
    Appointment.findByIdAndUpdate(id, {status:'attending'})
        .then((appointment) => {
            // 2. When the appointment is updated, redirect
            res.redirect("/dashboard");
        })
        .catch((err) => {
            res.render("/dashboard", {
                errorMessage: `Error during appointment status update`,
            });
        });
})

// UPDATE APPOINTMENT, CHANGE STATUS TO ATTENDING (TO DONE QUEUE)
// POST         '/dashboard/done/:id'       
siteRouter.post('/dashboard/done/:id', isLoggedIn, (req, res, next) => {
    const { id } = req.params;

    // 1. Search  appointment in DB to change status.
    Appointment.findByIdAndUpdate(id,{status:'attended'})
        .then((appointment) => {

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