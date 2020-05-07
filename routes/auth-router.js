const express = require("express");
const authRouter = express.Router();
const Admin = require("./../models/admin-model");
const Appointment = require("./../models/appointment-model")
const Queue = require("./../models/queue-model")
const Room = require("./../models/room-model")
const Praxis = require("./../models/praxis-model")


const bcrypt = require("bcrypt");
const saltRounds = 12;

function isNotLoggedIn(req, res, next) {
  if (!req.session.currentUser) { // If user is authenticated
    next();
  } else {
    res.redirect('/dashboard');
  }
}
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
const roomObj = {
  name: 'Room 54',
  description: 'Treatment room',
  numSpots: 9,
  queues: [],
  spotsOccupied: [],
}
const praxisObj = {
  organizationName: 'Hospital',
  owner: 'Health Corp',
  queues: [],
  rooms: []
}

function autoAssetsCreate() {

  let queueId, roomId

  return Queue.create(queueObj)
    .then((queue) => {
      queueId = queue._id
      return Room.create(roomObj)
    })
    .then((room) => {
      roomId = room._id
      return Praxis.create({ ...praxisObj, queues: [queueId], rooms: [roomId] })
    })
}


//const zxcvbn = require("zxcvbn");

// GET    '/auth/signup'     -  Renders the signup form
authRouter.get("/signup", isNotLoggedIn, (req, res) => {
  res.render("auth-views/signup-form");
});

// // POST    '/auth/signup'
authRouter.post("/signup", (req, res, next) => {
  // 1. Get the email and password from req.body
  const { name, phone, email, password } = req.body;
  console.log(password);


  // 2.1 Check if the email and password are provided
  if (email === "" || password === "" || name === "" || phone === "") {
    res.render("auth-views/signup-form", {
      errorMessage: "email and Password are required.",
    }); console.log(email);
    return; // stops the execution of the function furhter
  }

  // // 2.2 Verify the password strength
  // // const passwordStrength = zxcvbn(password).score;

  // // console.log("zxcvbn(password) :>> ", zxcvbn(password));
  // // console.log("passwordStrenth :>> ", passwordStrength);
  // // if (passwordStrength < 3) {
  // //   res.render("auth-views/signup-form", {
  // //     errorMessage: zxcvbn(password).feedback.warning,
  // //   });
  // //   return;
  // // }

  // 3. Check if the email is not taken
  Admin.findOne({ email })
    .then((userObj) => {
      if (userObj) {
        // if user was found
        res.render("auth-views/signup-form", {
          errorMessage: `email ${email} is already taken.`,
        });
        return;
      } else {
        // Allow the admin to signup if above conditions are ok

        // 4. Generate salts and encrypt the password
        const salt = bcrypt.genSaltSync(saltRounds);
        const hashedPassword = bcrypt.hashSync(password, salt);

        autoAssetsCreate()
          .then((praxis) => {
            console.log('praxis :>> ', praxis);
            return Admin.create({ email, password: hashedPassword, name, phone, praxis: [praxis._id] })

            // 6. When the admin is created, redirect (we choose - home page) 

          })

          // 5. Create new admin in DB, saving the encrypted password
          .then((user) => {
            res.redirect("/auth/login");
            // creates room, Q, and praxis and returns a pending promise
          })

          .catch((err) => {
            res.render("auth-views/signup-form", {
              errorMessage: `Error during signup`,
            });
          });
      }
    })
    .catch((err) => next(err));

  //X.  Catch errors coming from calling to User collection
});

// GET  '/auth/login'
authRouter.get("/login", isNotLoggedIn, (req, res) => {
  res.render("auth-views/login-form")

})



// POST    '/auth/login'
authRouter.post("/login", (req, res, next) => {
  const { password, email } = req.body;

  // 1. Check if the email and password are provided
  if (email === "" || password === "") {
    res.render("auth-views/login-form", {
      errorMessage: "email and Password are required.",
    });
    return; // stops the execution of the function further
  }

  // 2. Check if the user/email exist in the DB
  Admin.findOne({ email })
    .then((user) => {
      // 3.1 If the user is not found, show error message
      if (!user) {
        console.log('object :>> ', object);
        res.render("auth-views/login-form", { errorMessage: "Input invalid" });
      } else {
        // 3.2 If user exists ->  Check if the password is correct
        const encryptedPassword = user.password;
        const passwordCorrect = bcrypt.compareSync(password, encryptedPassword);

        if (passwordCorrect) {
          // 4. If password is correct, login the user by creating session
          // Pass the user data to the session middleware by setting the value on:
          // req.session.currentUser
          user.password = "****";
          req.session.currentUser = user;

          // 5. Redirect the user to some page (we choose - home page)
          res.redirect("/profile");
        } else {
          res.render("auth-views/login-form", { errorMessage: "Input invalid" });

        }
      }
    })
    .catch((err) => console.log(err));
});

// GET   '/auth/logout'
authRouter.get("/logout", (req, res) => {
  // We remove/destroy the session record in the database
  req.session.destroy((err) => {
    if (err) {
      res.render("error", { message: "Something went wrong! Yikes!" });
    }
    // Redirect to the page (we choose - home page)
    res.redirect("login");
  });
});


module.exports = authRouter;