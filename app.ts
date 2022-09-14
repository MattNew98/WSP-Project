import express from 'express'
import expressSession from 'express-session'
import { Client } from 'pg'
// import fs from 'fs'
import http from 'http'
import { Server as SocketIO } from 'socket.io'
import { userRoutes } from './routes/userRoute'
import { lobbyRoutes } from './routes/lobbyRoute'
import grant from 'grant'
import dotenv from 'dotenv'
import { isloggedin } from './guard'
let drawBoardArray: any = []
let roomList: any = []
let id = 0
// [{ roomName: string, players: [player: string] }]
// let barStatus: number
let counter = 0
dotenv.config()
declare module 'express-session' {
    interface SessionData {
        username?: string
        isloggedin?: boolean
        user?: any
    }
}



const app = express()

const server = new http.Server(app);
export const io = new SocketIO(server);

io.on('connection', function (socket) {
    socket.on("new-line", ({ mouseX, mouseY, pmouseX, pmouseY, selectedColor, selectedStrokeWeight }) => {
        drawBoardArray.push({ mouseX, mouseY, pmouseX, pmouseY, selectedColor, selectedStrokeWeight });//push current emit data to array
        socket.broadcast.emit("draw-new-line", { mouseX, mouseY, pmouseX, pmouseY, selectedColor, selectedStrokeWeight })
        // console.log(emits)


    })
    socket.on('new-fill', ({ mouseX, mouseY, selectedColor }) => {
        socket.broadcast.emit('draw-new-fill', { mouseX, mouseY, selectedColor })
    })
    socket.on("clear-board", () => {
        socket.broadcast.emit("clear", (255)) // ask sockets to clear the board
        drawBoardArray = []
    }
    )

    socket.on("get-board", () => {
        socket.emit("show-board", ({ drawBoardArray })) //send drawBoardArray to js//
    })

    console.log(socket.id);

    socket.on("chat", ({ content, userName }) => {
        console.log(`${userName}: ${content}`)
        io.emit("chat", ({ content, userName }))
    })
    socket.on("barStart", () => {

        if (counter > 1) {
            return
        }
        counter
        io.emit("bar-Start")

    })

    socket.on('create-room', ({ username }) => {

        roomList.push({ id: `${id}`, roomName: `${username}'s Room`, players: [username] })
        io.emit('new-room', { id });
        socket.join(`${id}`)
        id++

    })

    socket.on('fetch-room', () => {
        io.emit('update-room', ({ roomList }));
    })

    socket.on('join-room', (data) => {
        const i = data.id
        roomList[i].players.push(data.username)
        console.log(roomList[i])
        io.emit('update-room', ({ roomList }));
        socket.join(`${i}`)
        console.log('join room:', i)

    })

    socket.on('start-game', (id) => {

        console.log('start-game', id)
        io.to(`${id}`).emit('launch-game', (id))

    })

    socket.on('fetch-room-data', (id) => {
        socket.emit('show-room-data', (roomList[id]))
    })
})

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
app.use('/lobby', lobbyRoutes)



app.post('/users', (req, res) => {
    // Business logic here
    io.emit("new-user", "Congratulations! New User Created!");
    res.json({ updated: 1 });
});









app.use(express.static('public'))
app.use(isloggedin, express.static('private'))
// app.use(express.static('private'))
app.post('/chats', (req, res) => {
    console.log(123123)
})

app.use((req, res) => {
    res.redirect('/404.html')
})


const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}/`);
})
