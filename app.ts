import express from 'express'
import expressSession from 'express-session'
import { Client } from 'pg'
// import fs from 'fs'
import http from 'http'
import { Server as SocketIO } from 'socket.io'
import { userRoutes } from './routes/userRoute'
import grant from 'grant'
import dotenv from 'dotenv'


dotenv.config()
declare module 'express-session' {
    interface SessionData {
        name?: string
        isloggedin?: boolean
    }
}

const app = express()

const server = new http.Server(app);
const io = new SocketIO(server);

io.on('connection', function (socket) {
    socket.on("new-line", ({ mouseX, mouseY, pmouseX, pmouseY, selectedColor }) => {
        socket.broadcast.emit("draw-new-line", { mouseX, mouseY, pmouseX, pmouseY, selectedColor })
    })

    socket.on("clear-board", () => {
        socket.broadcast.emit("clear", (255))
    }
    )
    // socket.on("new-color", ({ selectedColor }) => {
    //     socket.broadcast.emit("draw-new-color", { selectedColor })
    //     // console.log("selectedColor: " + selectedColor)
    // })
    console.log(socket.id);
});



app.use(express.json())
app.use(express.urlencoded({ extended: true }))

export const client = new Client({
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
})


client.connect()
let sessionMiddleware = expressSession({
    secret: 'Tecky Academy teaches typescript',
    resave: true,
    saveUninitialized: true
})

app.use(sessionMiddleware)


const grantExpress = grant.express({
    "defaults": {
        "origin": "http://localhost:8080",
        "transport": "session",
        "state": true,
    },
    "google": {
        "key": process.env.GOOGLE_CLIENT_ID || "",
        "secret": process.env.GOOGLE_CLIENT_SECRET || "",
        "scope": ["profile", "email"],
        "callback": "/user/login/google"
    }
});

app.use(grantExpress as express.RequestHandler);

app.use('/user', userRoutes)



declare module 'express-session' {
    interface SessionData {
        username?: string
        isLoggedIn?: boolean
        age?: number

    }
}


app.post('/users', (req, res) => {
    // Business logic here
    io.emit("new-user", "Congratulations! New User Created!");
    res.json({ updated: 1 });
});



app.use(express.static('public'))


app.use((req, res) => {
    res.redirect('/404.html')
})


const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}/`);
});
