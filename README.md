# Qhops

## Description

Queue management sistem (QMS) for hospitals.

## Admin Stories

- **404** - As a user I want to see a nice 404 page when I go to a page that doesn’t exist so that I know it was my fault

- **500** - As a user I want to see a nice error page when the super team screws it up so that I know that is not my fault

- **homepage** - As an admin I want to be able to access the homepage so that I see what the app is about and login.

- **Dashboard** - As an admin I want to able toselect que queue by date, add and delete appointments, ad move them among the lists.

- **Dashboard** - As an admin I want to able toselect que queue by date, add and delete appointments, ad move them among the lists.

- **login** - As an admin I want to be able to log in on the webpage so that I can get back to my account

- **logout** - As an admin I want to be able to log out from the webpage so that I can make sure no one will access my account

## User Stories

- **404** - As a user I want to see a nice 404 page when I go to a page that doesn’t exist so that I know it was my fault

- **500** - As a user I want to see a nice error page when the super team screws it up so that I know that is not my fault

- **PUBLIC Q VIEW** - As a user I want to be able to to access a public webpage to see the queue.

## Backlog

List of other features outside of the MVPs scope

- multiple privileges

- Multiple Rooms

- User login

- Mapbox API implementation

- Profile page (user / admin)

- SSL Server implementation

- app transformation

- Multiple Office / praxis

## ROUTES:

- GET /

  - renders the homepage

- GET /add/appointment

  - renders the add appointment form

- POST /add/appointment

  - redirects to / once created
  - body:
    - Patient name
    - email
    - Telf
    - isUrgent
    - Tags

- GET /auth/login

  - redirects to / if admin logged in
  - renders the login form

- POST /auth/login

  - redirects to / if user logged in
  - body:
    - username
    - password

- POST /auth/logout

  - body: (empty)

- GET /queue

  - renders the queue

- GET /dasboard

  - Render the dashboard

- POST / dashboard/to_room

  - Move appointment from the waiting queue to room queue
  - Render the dashboard

- POST / dashboard/delete

  - Move appointment out of the waiting queue
  - Render the dashboard

- POST / dashboard/done

  - Move appointment from the room queue to the done queue
  - Render the dashboard

- GET /dashboard/queue/:id

  - renders a specific date queue
  - includes the list of appointments and kpi's

## Models

Admin model

```
email: String
name: String
phone: number
password: String
tags: String
isBusy:bolean
occupation: {type: String, enum: [ "nurse", "doctor", "secretary"]
```

Appointment model

```
code: String,
fName: String,
lName: String,
tags: [String]
isUrgent: Boolean
status:{
  	type: String,
    enum: [ "waiting", "attending", "attended"]
		appointment_start_At: Date
		appointment_finished_At: Date
		}
```

Queue model

```
appointments: [ {type: ObjectId, ref: "Appointment" } ],
inProgress: [{type: ObjectId, ref: "Appointment" }],
appointments_done: [{type: ObjectId, ref: "Appointment" }],
roomId: String ????
nurseId: ObjectId
date: Date
capacity:  Number      ( numSpots*workingHours )
patientsServed: Number
avgTime: Number   ( timepast / patients_Served )
```

Praxis model

```
organizationName: String,
owner: String,
queues: [  {type: ObjectId, ref: "Q" } ]
```

## Links

### Trello

[Link to your trello board](https://trello.com/) or picture of your physical board

### Git

The url to your repository and to your deployed project

[Repository Link](http://github.com/)

[Deploy Link](http://heroku.com/)

### Slides

The url to your presentation slides

[Slides Link](http://slides.com/)
