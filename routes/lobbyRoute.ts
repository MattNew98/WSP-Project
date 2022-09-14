import express from 'express'
// import { io } from '../app'

// let roomList: [{ roomName: string, players: [player: string] }]

export const lobbyRoutes = express.Router()

// io.on('connection', function (socket) {
//     socket.on('create-room', ({ username }) => {
//         roomList.push({ roomName: `${username}'s Room`, players: [username] })
//         socket.broadcast.emit('new-room');
//         console.log(roomList)
//     })

//     socket.on('fetch-room', () => {
//         socket.broadcast.emit('update-room', ({ roomList }));
//     })
// })

// lobbyRoutes.get('/', async (req, res) => {

// })

// lobbyRoutes.post('/', async (req, res) => {
//     try {
//         const userName = await 




//     }

// })