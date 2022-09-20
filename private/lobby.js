// CHANGE IP BEFORE OPEN SERVER!!!!! // "192.168.59.61:8080" "localhost:8080"
let SERVER_IP = "localhost:8080"
const socket = io.connect(SERVER_IP);
const createButton = document.querySelector(".create-room-btn")
const roomContainer = document.querySelector('.room-container')
const roomButtons = document.querySelector('.room-buttons')
const musicButton = document.querySelector('.music-button')
let music = document.getElementById('lobbyMusic')
let result
let username
let userID
let socketID
let playerList = []
let userIcon
let playingMusic = false


async function getProfile() {
    const res = await fetch('/user/me')
    result = await res.json()
    userIcon = result.image
    username = result.username
    userID = result.id
    socket.emit('room-check', (username))
    document.querySelector('.user-name').innerHTML = `Welcome ${username} !!!`
    document.querySelector('.user-icon').innerHTML = `<img src="${userIcon}" alt="User Image"/>`
}
getProfile()
// window.onpopstate = function () {
//     location.reload()
// };

window.onpageshow = function (event) {
    if (event.persisted) {
        window.location.reload();
    }
};


socket.emit('fetch-room')


function playMusic() {
    if (playingMusic == false) {
        music.play()
        playingMusic = true
        musicButton.innerHTML = `
        <img  id='on' src="./img/speaker-on.png"></img>
        `
    } else {
        music.pause()
        playingMusic = false
        musicButton.innerHTML = `
        <img  id='off' src="./img/speaker-off.png"></img>
        `
    }
}


socket.on('leaderBoard', (leaderBoard) => {
    let scoreBoardInAscendingOrder = leaderBoard.sort(function (a, b) {
        return parseFloat(b.score) - parseFloat(a.score)
    })
    let boardContent = document.querySelector('.board-content')
    let counter = 1
    boardContent.innerHTML = ``
    for (let player of scoreBoardInAscendingOrder) {
        boardContent.innerHTML += `<div class="player-content">
            <p class="player-score">#${counter}<img class="leaderImage" src="${player.userIcon}" /> ${player.username}</p>
            <p class="player-score scorePosition">Score: ${player.score}</p>
        </div>`
        counter++
    }
})

async function displayRoom(id, roomName, roomIcon, players, start, odd) {


    if (odd == true) {
        odd = 0
    } else {
        odd = 1
    }
    if (players[0].name == username && start != true) {

        roomButtons.innerHTML = `
    <input class="remove-room-btn" type="button" value="Remove Room" onclick="removeRoom()"/>
    `

        roomContainer.innerHTML += `
    <div class="room${id} roomStyle${odd}" >
    <div><img src="${roomIcon}" class="roomIcon">
    <div>${roomName}</div></div>
    
    <div class="room-${id}-players">
    Players:
    </div>
    <div class="room-${id}-buttons">
    <button class="start-button" value="Start" onclick="startGame(${id})">Start</button>
    </div>
    </div>
    `
    } else if (start === true) {


        roomContainer.innerHTML += `
        <div class="room${id} roomStyle${odd}" >
        <div><img src="${roomIcon}" class="roomIcon">
        <div>${roomName}</div></div>
    <div class="room-${id}-players">
    Players:
    </div>
    <div>Game In Progress</div>
    </div>
    `
    } else if (isParticipant(username, players)) {
        roomContainer.innerHTML += await `
        <div class="room${id} roomStyle${odd}" >
        <div><img src="${roomIcon}" class="roomIcon">
        <div>${roomName}</div></div>
        <div class="room-${id}-players">
        Players:
        </div>
        <div class="room-${id}-buttons">
        <button class="Leave-button value="Leave" onclick="leaveGame(${id})">Leave</button>
        </div>
        </div>
        `
    } else {
        roomContainer.innerHTML += `
        <div class="room${id} roomStyle${odd}" >
        <div><img src="${roomIcon}" class="roomIcon">
        <div>${roomName}</div></div>
        <div class="room-${id}-players">
        Players:
        </div>
        <div class="room-${id}-buttons">
        <button class="join-button" value="Join" onclick="joinGame(${id})">Join</button>
        </div>
        </div>
        `
    }


    for (let player of players) {
        let playerContainer = document.querySelector(`.room-${id}-players`)

        playerContainer.innerHTML += `<div class="player-container"><img src="${player.userIcon}" class="player-icon">
        <div class="player">${player.name}</div></div>
        `

    }



}

function isParticipant(name, players) {
    for (let player of players) {
        if (player.name == name) {
            return true
        }
    }
}


function joinGame(id) {
    // console.log(username)
    socket.emit('join-room', ({ id, username, userIcon, userID }))
    socketID = id
}

function leaveGame(id) {
    socket.emit('leave-game', ({ username, id }))
    socketID = null
}

function startGame(id) {
    socket.emit('start-game', (id))
}


function createRoom() {
    socket.emit('create-room', ({ username, userIcon, userID }))
    if (playingMusic == false) {
        // playMusic()
    }

}

function removeRoom() {
    // console.log(username)
    socket.emit('remove-room', (username))
    roomButtons.innerHTML = `
    <input class="create-room-btn" type="button" value="Create Room" onclick="createRoom()"/>
    <i class="fa-solid fa-plus"></i>
    `
}

socket.on('launch-game', (id) => {
    if (SERVER_IP[0] == "l") {
        location.assign(`/game.html?id=${id}`)
    } else {
        location.assign(`http://${SERVER_IP}/game.html?id=${id}`)
    }

})

socket.on('new-room', (data) => {
    // console.log(data.id)
    socketID = data.id
    socket.emit('fetch-room')
})

socket.on('update-room', ({ roomList }) => {
    // console.log("test" + roomList)
    let counter = 1
    roomContainer.innerHTML = ' '
    for (let room of roomList) {
        if (counter % 2 == 0) {
            odd = false
        } else { odd = true }
        displayRoom(room.id, room.roomName, room.roomIcon, room.players, room.start, odd)
        counter++
    }

})

socket.on('room-error', (data) => {
    window.alert(data)
}
)

socket.on('room-created', () => {
    roomButtons.innerHTML = `
    <input class="remove-room-btn" type="button" value="Remove Room" onclick="removeRoom('${username}')"/>
    `
})



