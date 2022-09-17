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
// import cors from 'cors'
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
        image?: any
    }
}



const app = express()
// app.use(cors())

const server = new http.Server(app);
export const io = new SocketIO(server);

io.on('connection', function (socket) {
    socket.on("new-line", ({ mouseX, mouseY, pmouseX, pmouseY, selectedColor, selectedStrokeWeight, socketID, emitter }) => {
        roomList[socketID].drawBoardArray.push({ mouseX, mouseY, pmouseX, pmouseY, selectedColor, selectedStrokeWeight });//push current emit data to array
        io.to(`${socketID}`).emit("draw-new-line", { mouseX, mouseY, pmouseX, pmouseY, selectedColor, selectedStrokeWeight, emitter })
        // console.log(emits)


    })
    socket.on('new-fill', ({ mouseX, mouseY, selectedColor, socketID, emitter }) => {
        io.to(`${socketID}`).emit('draw-new-fill', { mouseX, mouseY, selectedColor, emitter })
    })
    socket.on("clear-board", ({ socketID, emitter }) => {
        // console.log(socketID)
        io.to(`${socketID}`).emit("clear", (emitter)) // ask sockets to clear the board

        roomList[socketID].drawBoardArray = []
    }
    )

    socket.on("get-board", (socketID) => {
        for (let room of roomList) {
            if (room.id == socketID) {
                io.to(`${socketID}`).emit("show-board", (room.drawBoardArray)) //send drawBoardArray to js//
            }
        }

    })



    socket.on("chat", ({ content, username, socketID }) => {
        // console.log(socketID)
        console.log(`${username}: ${content}`)
        io.to(`${socketID}`).emit("chat", ({ content, username }))
    })
    socket.on("barStart", () => {

        if (counter > 1) {
            return
        }
        counter
        io.emit("bar-Start")

    })

    socket.on('create-room', ({ username, userIcon }) => {

        roomList.push({ id: `${id}`, roomName: `${username}'s Room`, players: [{ name: username, score: 0, userIcon: userIcon }], drawBoardArray: [], start: false, drawing: username, topics: [] })
        // roomList[id].players.push({ name: username, score: 0 })
        io.emit('new-room', { id });
        socket.join(`${id}`)
        // console.log(roomList[id].players)
        id++

    })

    socket.on('fetch-room', () => {
        io.emit('update-room', ({ roomList }));
    })

    socket.on('join-room', (data) => {

        let inRoom = false
        let username = data.username
        let userIcon = data.userIcon
        let i = data.id
        console.log(i)
        console.log(roomList)
        for (let room of roomList) { //check if user is already a host
            // console.log(room)
            for (let player of room.players) {
                if (player.name === username) {
                    socket.emit('join-room-error', ('You are in another room. \r Please leave your room and try again.'))
                    inRoom = true
                }
            }
        }

        if (inRoom == false) {

            for (let room of roomList) {
                if (room.id == i) {
                    console.log('ok')
                    room.players.push({ name: username, score: 0, userIcon })
                    io.emit('update-room', ({ roomList }));
                    socket.join(`${i}`)
                }
            }

            //     if (roomList[i]) {
            //         console.log('ok')
            //         roomList[i].players.push({ name: username, score: 0, userIcon })
            //         io.emit('update-room', ({ roomList }));
            //         socket.join(`${i}`)
            //     }
            // } else return

        }

    })

    socket.on('start-game', async (id) => {
        for (let room of roomList) {
            if (room.id == id) {
                let topicAmount = room.players.length * 4
                for (let x = 0; x < topicAmount; x++) {
                    let randomTopic = Math.floor(Math.random() * 55) + 1
                    let topicDB = await client.query(`select topic from topics where id = ${randomTopic}`)
                    let topic = topicDB.rows[0].topic
                    room.topics.push(topic)
                }
                io.to(`${id}`).emit('launch-game', (id))
                room.start = true
                // console.log(roomList[id])
                io.emit('update-room', ({ roomList }));
            }
        }

        // console.log(id)
        // io.to(`${id}`).emit('launch-game', (id))
        // roomList[id].start = true
        // // console.log(roomList[id])
        // io.emit('update-room', ({ roomList }));
    })

    socket.on('fetch-room-data', (id) => {
        for (let room of roomList) {
            if (room.id === id) {
                socket.join(`${id}`)
                socket.emit('show-room-data', (room))
            }
        }
    })

    socket.on('remove-room', (username) => {


        let index = 0
        for (let room of roomList) {

            if (room.players[0].name == username) {
                roomList.splice(index, 1)

                io.emit('update-room', ({ roomList }))

            } else { index++ }

        }


    })

    socket.on('user-scored', ({ username, score, socketID }) => {
        // console.log(username, score, socketID)
        // console.log("2222222")
        for (let player of roomList[socketID].players) {
            if (player.name == username) {
                player.score = player.score + score
            }
        }
        let players = roomList[socketID].players
        io.to(`${socketID}`).emit('score-update', (players))

    })

    socket.on('leave-game', ({ username, socketID }) => {
        let index = 0
        let p = 0
        for (let room of roomList) {
            if (room.id == socketID) {
                if (room.players[0].name == username) {
                    io.to(`${socketID}`).emit('host-left')
                    roomList.splice(index, 1)
                    io.emit('update-room', ({ roomList }))

                } else {
                    for (let player of room.players) {

                        if (player.name == username) {
                            io.to(`${socketID}`).emit('player-left')
                            room.players.splice(p, 1)
                            console.log(room.players)

                            io.emit('update-room', ({ roomList }))
                            console.log('Player:' + username + ' has left the game')

                        }
                        p++
                    }
                }


            }
            index++
        }

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
        // "origin": "http://192.168.59.242:8080",
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








app.use(express.static('uploads'))

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
