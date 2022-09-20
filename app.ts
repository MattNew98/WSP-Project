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
    //LOBBY SOCKETS
    socket.on('fetch-room', async () => {//update rooms in lobby
        io.emit('update-room', ({ roomList }))
        let leaderBoard: any = []
	let getAllUser = await client.query(
		`SELECT username FROM users;`)
	for (let user of getAllUser.rows) {
		leaderBoard.push({ username: user.username, score: 0 })
	}
	let getScores = await client.query(
		`SELECT username,score FROM users JOIN records ON users.id = records.user_id`)

	for (let user of leaderBoard) {
		for (let score of getScores.rows) {
			if ( user.username == score.username) {
				user.score += score.score
			}
		}
	}
    io.emit('leaderBoard', leaderBoard)
    })

    socket.on('room-check', async (username) => {
        let index = 0
        for (let room of roomList) {
            for (let player of room.players) {
                if (player.name === username) {
                    let socketID = room.id
                    let host = room.players[0].name
                    room.players.splice(index, 1)
                    io.emit('update-room', ({ roomList }))
                    let name = username
                    io.to(`${socketID}`).emit('player-left', ({ name, host }))
                    if (room.players.length < 2 && room.start == true) {
                        room.drawBoardArray = []
                        io.to(`${socketID}`).emit("clear") // ask sockets to clear the board
                        io.to(`${socketID}`).emit("show-topic")
                        io.to(`${socketID}`).emit("game-ended")
                        for (let player of room.players) {
                            await client.query(
                                `insert into records (username, score, created_at) values ($1, $2, current_timestamp)`,
                                [player.name, player.score ]
                            )
                        }

                        roomList.splice(index, 1)
                        io.emit('update-room', ({ roomList }))
                        console.log('Player:' + username + ' has left the game')
                    }
                }
                index++
            }
        }
    })
    socket.on('create-room', ({ username, userIcon }) => {//create a new room
        let inRoom = false
        for (let room of roomList) {
            for (let player of room.players) {
                if (player.name === username) {
                    inRoom = true
                    socket.emit('room-error', ('You are in another room. \r Please leave your room and try again.'))
                }
            }
        }
        if (inRoom == false) {
            roomList.push({ id: `${id}`, roomName: `${username}'s Room`, roomIcon: userIcon, players: [{ name: username, score: 0, userIcon: userIcon }], drawBoardArray: [], start: false, drawingPlayer: username, topics: [], barWidth: 100, turn: 0, round: 1, guessed: 0 })
            io.emit('new-room', { id });
            socket.emit('room-created')
            socket.join(`${id}`)
            id++
        }
    })

    socket.on('remove-room', (username) => {//remove room you created
        let index = 0

        for (let room of roomList) {
            {
                if (room.players[0].name === username) {
                    roomList.splice(index, 1)
                    io.emit('update-room', ({ roomList }))
                } else { index++ }
            }
        }

    })

    socket.on('join-room', (data) => {//join a room
        let inRoom = false
        let username = data.username
        let userIcon = data.userIcon
        let id = data.id
        for (let room of roomList) { //check if user is already a host
            // console.log(room)
            for (let player of room.players) {
                if (player.name === username) {
                    socket.emit('room-error', ('You are in another room. \r Please leave your room and try again.'))
                    inRoom = true
                }
            }
        }
        if (inRoom == false) {
            for (let room of roomList) {
                if (room.id == id) {
                    socket.join(`${id}`)
                    room.players.push({ name: username, score: 0, userIcon })
                    io.emit('update-room', ({ roomList }));

                }
            }
        }
    })


    socket.on('start-game', async (id) => {//start the game
        for (let room of roomList) {
            if (room.id == id) {

                if (room.players.length <= 1) {
                    socket.emit('room-error', ("Don't play alone. That's sad :("))
                    return
                }
                let topicAmount = room.players.length * room.round
                let ranNums: any = []
                while (ranNums.length < topicAmount) {
                    let j = Math.floor(Math.random() * (100) + 1); //change total number of topics
                    if (!ranNums.includes(j)) {
                        ranNums.push(j);
                    }
                }
                for (let ranNum of ranNums) {
                    let topicDB = await client.query(`select topic from topics where id = ${ranNum}`)
                    let topic = topicDB.rows[0].topic
                    room.topics.push(topic)
                }


                // for (let x = 0; x < topicAmount; x++) {
                //     let randomTopic = Math.floor(Math.random() * 55) + 1
                //     let topicDB = await client.query(`select topic from topics where id = ${randomTopic}`)
                //     let topic = topicDB.rows[0].topic
                //     room.topics.push(topic)
                // }


                io.to(`${id}`).emit('launch-game', (id))
                room.start = true
                io.emit('update-room', ({ roomList }));
            }
        }
    })

    socket.on('leave-game', async (data) => {//leave the game
        // console.log(data)
        let socketID = data.id
        let username = data.username
        let index = 0
        let p = 0
        for (let room of roomList) {
            if (room.id == socketID) {
                if (room.players[0].name === username) {
                    let host = username
                    io.to(`${socketID}`).emit('host-left', (host))
                    roomList.splice(index, 1)
                    io.emit('update-room', ({ roomList }))

                } else {
                    for (let player of room.players) {
                        if (player.name === username) {
                            if (username === room.drawingPlayer) {

                                let turn = room.turn
                                if (turn >= room.players.length) {
                                    turn = turn % room.players.length
                                }
                                room.drawingPlayer = room.players[turn].name
                                // console.log(room.drawingPlayer)
                                room.guessed = 0
                                room.barWidth = 0
                                room.drawBoardArray = []
                                io.to(`${socketID}`).emit("clear") // ask sockets to clear the board
                                io.to(`${socketID}`).emit("next-turn")
                            }
                            let name = username
                            let host = room.players[0].name
                            io.to(`${socketID}`).emit('player-left', ({ name, host }))
                            room.players.splice(p, 1)
                            io.emit('update-room', ({ roomList }))
                            socket.leave(`${socketID}`)
                            if (room.players.length < 2 && room.start == true) {
                                room.drawBoardArray = []
                                io.to(`${socketID}`).emit("clear") // ask sockets to clear the board
                                io.to(`${socketID}`).emit("show-topic")
                                io.to(`${socketID}`).emit("game-ended")
                                for (let player of room.players) {
                                    await client.query(
                                        `insert into records (username, score, created_at) values ($1, $2, current_timestamp)`,
                                        [player.name, player.score ]
                                    )
                                }

                                roomList.splice(index, 1)
                                io.emit('update-room', ({ roomList }))
                                console.log('Player:' + username + ' has left the game')
                            }
                        }

                        p++
                    }
                }
            }
            index++
        }
    })


    //GAME SOCKETS
    socket.on("new-line", ({ mouseX, mouseY, pmouseX, pmouseY, selectedColor, selectedStrokeWeight, socketID, emitter }) => {//standard drawing
        let fill = false
        for (let room of roomList) {
            if (room.id == socketID) {
                room.drawBoardArray.push({ mouseX, mouseY, pmouseX, pmouseY, selectedColor, selectedStrokeWeight, fill });//push current emit data to array
                io.to(`${socketID}`).emit("draw-new-line", { mouseX, mouseY, pmouseX, pmouseY, selectedColor, selectedStrokeWeight, emitter })
            }
        }
    })

    socket.on('new-fill', ({ mouseX, mouseY, selectedColor, socketID, emitter }) => {//fill bucket
        let fill = true
        for (let room of roomList) {
            if (room.id == socketID) {
                room.drawBoardArray.push({ mouseX, mouseY, selectedColor, fill });//push current emit data to array
                io.to(`${socketID}`).emit('draw-new-fill', { mouseX, mouseY, selectedColor, emitter })
            }
        }

    })

    socket.on("clear-board", ({ socketID, emitter }) => {//clear drawBoard
        // console.log(socketID)
        io.to(`${socketID}`).emit("clear", (emitter)) // ask sockets to clear the board
        for (let room of roomList) {
            if (room.id == socketID) {
                room.drawBoardArray = []
            }
        }
    }
    )

    socket.on("get-board", (socketID) => {//load drawBoard
        for (let room of roomList) {
            if (room.id == socketID) {
                io.to(`${socketID}`).emit("show-board", (room.drawBoardArray)) //send drawBoardArray to js//
            }
        }
    })

    socket.on("chat", ({ content, username, socketID }) => {//game chat
        // console.log(socketID)
        // console.log(`${username}: ${content}`)
        io.to(`${socketID}`).emit("chat", ({ content, username }))
    })

    socket.on('fetch-room-data', (id) => {//get latest room data
        for (let room of roomList) {
            if (room.id === id) {
                socket.join(`${id}`)
                socket.emit('show-room-data', (room))
            }
        }
    })



    socket.on('user-scored', ({ username, score, socketID }) => {//update user scores
        // console.log(username, score, socketID)
        for (let room of roomList) {
            if (room.id == socketID) {
                for (let player of room.players) {
                    if (player.name == username) {
                        player.score = player.score + score
                    }
                    if (player.name === room.drawingPlayer) {
                        player.score = player.score + score
                    }
                }
                let players = room.players
                io.to(`${socketID}`).emit('score-update', (players))
                room.guessed++
                // console.log(room.players.length, room.guessed)
                if (room.guessed == room.players.length - 1) {
                    // console.log('ding')
                    io.to(`${socketID}`).emit('stop-move')
                    room.guessed = 0
                }
            }
        }
    })
    socket.on('bar-moving', async (data) => {
        let width = data.width
        let id = data.socketID
        // let emitter = data.emitter
        for (let room of roomList) {
            if (room.id == id) {

                room.barWidth = width
                if (room.barWidth == 0) {
                    room.turn++
                    let turn = room.turn
                    if (turn >= room.players.length) {
                        turn = turn % room.players.length
                    }
                    if (room.turn / room.round == room.players.length) {
                        room.drawBoardArray = []
                        io.to(`${id}`).emit("clear") // ask sockets to clear the board
                        io.to(`${id}`).emit("show-topic")
                        io.to(`${id}`).emit("game-ended")
                        for (let player of room.players) {
                            await client.query(
                                `insert into records (username, score, created_at) values ($1, $2, current_timestamp)`,
                                [player.name, player.score]
                            )
                        }

                        let index = 0
                        for (let room of roomList) {
                            if (room.id === id) {
                                roomList.splice(index, 1)
                                io.emit('update-room', ({ roomList }))
                            } else { index++ }
                        }
                        return
                    }

                    room.drawingPlayer = room.players[turn].name
                    room.barWidth = 100
                    room.guessed = 0

                    // set interval
                    // setTimeout(() => {},3000)

                    io.to(`${id}`).emit("next-turn")
                    io.to(`${id}`).emit("clear") // ask sockets to clear the board
                    io.to(`${id}`).emit("show-topic")
                } else if (room.barWidth == 100) {
                    return
                } else {
                    let width = room.barWidth
                    let emitter = room.drawingPlayer
                    io.to(`${id}`).emit("move-bar", ({ width, emitter }))
                }
            }

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
    // console.log(123123)
})

app.use((req, res) => {
    res.redirect('/login.html')
})

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}/`);
})
