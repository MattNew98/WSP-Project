// CHANGE IP BEFORE OPEN SERVER!!!!! // "192.168.59.61:8080" "localhost:8080"
let SERVER_IP = "localhost:8080"
const socket = io.connect(SERVER_IP);
const createButton = document.querySelector(".create-room-btn")
const roomContainer = document.querySelector('.room-container')
const roomButtons = document.querySelector('.room-buttons')
let result
let username
let socketID

async function getProfile() {
    const res = await fetch('/user/me')
    result = await res.json()
    userIcon = result[0].image
    username = result[0].username
    console.log(userIcon)
    console.log(username)
    document.querySelector('.user-name').innerHTML = `Welcome ${username} !!!`
    document.querySelector('.user-icon').innerHTML = `<img src="${userIcon}">`
}
getProfile()

window.onload = () => { socket.emit('fetch-room') }


//// Create a new room

// async function loadRooms() {
//     const res = await fetch()
//     const data = await res.json()
//     if (res.ok) {
//         let html = ''
//         let room = 0
//         for (let room of data) {
//             html += `<a class="room" href="game.html">
//             <p>Room ${room}</p>
//             <div class="room-button">
//             <i class="fa-solid fa-person-dress"></i>
//             <i class="fa-sharp fa-solid fa-trophy"></i>
//             </div>
//             </a>`
//         }
//         const roomContainer = document.querySelector('.room-container')
//         roomContainer.innerHTML = html


//     }
// }


async function displayRoom(id, roomName, players, start) {


    if (players[0] == username) {
        roomContainer.innerHTML += await `
    <div class="room${id}">
    <div>${roomName}</div>
    <div class="room-${id}-players">

    </div>
    <div class="room-${id}-buttons">
    <button class="start-button" value="Start" onclick="startGame(${id})">Start</button>
    </div>
    </div>
    `
    } else if (start === true) {


        roomContainer.innerHTML += await `
    <div class="room${id}">
    <div>${roomName}</div>
    <div class="room-${id}-players">

    </div>
    <div>Game In Progress</div>
    </div>
    `
    } else if (players[1] == username || players[2] == username || players[3] == username) {
        roomContainer.innerHTML += await `
        <div class="room${id}">
        <div>${roomName}</div>
        <div class="room-${id}-players">
    
        </div>
        <div class="room-${id}-buttons">
        <button class="Leave-button value="Leave" onclick="leaveGame(${id})">Leave</button>
        </div>
        </div>
        `
    }
    else {
        roomContainer.innerHTML += await `
    <div class="room${id}" >
    <div>${roomName}</div>
    <div class="room-${id}-players">
 
    </div>
    <div class="room-${id}-buttons">
    <button class="join-button" value="Join" onclick="joinGame(${id})">Join</button>
    </div>
    </div>
    `
    }

    let p = 1
    for (let player of players) {
        let playerContainer = document.querySelector(`.room-${id}-players`)
        playerContainer.innerHTML += `
        <div>P${p}:${player}</div>
        `
        p++
    }

}



function joinGame(id) {
    console.log(username)
    socket.emit('join-room', ({ id, username }))
    socketID = id
}

function startGame(id) {
    socket.emit('start-game', (id))
}


function createRoom() {
    socket.emit('create-room', ({ username }))
    roomButtons.innerHTML = `
    <input class="remove-room-btn" type="button" value="Remove Room" onclick="removeRoom('${username}')"/>
    `
}

function removeRoom(username) {
    // console.log(username)
    socket.emit('remove-room', (username))
    roomButtons.innerHTML = `
    <input class="create-room-btn" type="button" value="Create Room" onclick="createRoom()"/>
    `
}

socket.on('launch-game', (id) => {
    if (SERVER_IP[0]== "l") {
        location.assign(`/game.html?id=${id}`)
    } else {
        location.assign(`http://${SERVER_IP}/game.html?id=${id}`)
    }
    
})
socket.on('room-started', (id) => {


})

socket.on('new-room', (data) => {
    // console.log(data.id)
    socketID = data.id
    socket.emit('fetch-room')
})

socket.on('update-room', ({ roomList }) => {
    roomContainer.innerHTML = ' '
    for (let room of roomList) {
        // console.log(room)
        displayRoom(room.id, room.roomName, room.players, room.start)
    }
})
