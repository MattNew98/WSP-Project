
const socket = io.connect();
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


function displayRoom(id, roomName, players) {
    if (players[0]) {
        p1 = players[0]
    } else { p1 = '-' }
    if (players[1]) {
        p2 = players[1]
    } else { p2 = '-' }
    if (players[2]) {
        p3 = players[2]
    } else { p3 = '-' }
    if (players[3]) {
        p4 = players[3]
    } else { p4 = '-' }

    if (players[0] == username) {
        roomContainer.innerHTML += `
    <div class="room">
    <div>${roomName}<div>
    <div>
    <i class="fa-solid fa-person-dress"></i>:${p1}
    <i class="fa-solid fa-person-dress"></i>:${p2}
    <i class="fa-solid fa-person-dress"></i>:${p3}
    <i class="fa-solid fa-person-dress"></i>:${p4}
    </div>
    <button class="start-button value="Start" onclick="startGame(${id})">Start</button>
    </div>
    `
    } else {
        roomContainer.innerHTML += `
    <div class="room">
    <div>${roomName}<div>
    <div>
    <i class="fa-solid fa-person-dress"></i>:${p1}
    <i class="fa-solid fa-person-dress"></i>:${p2}
    <i class="fa-solid fa-person-dress"></i>:${p3}
    <i class="fa-solid fa-person-dress"></i>:${p4}
    </div>
    <button class="join-button value="Join" onclick="joinGame(${id})">Join</button>
    </div>
    `
    }
}



function joinGame(id) {
    console.log('test')
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
    console.log(username)
    socket.emit('remove-room', (username))
    roomButtons.innerHTML = `
    <input class="create-room-btn" type="button" value="Create Room" onclick="createRoom()"/>
    `
}

socket.on('launch-game', (id) => {

    location.assign(`http://localhost:8080/game.html?id=${id}`)
})


socket.on('new-room', (data) => {
    console.log(data.id)
    socketID = data.id
    socket.emit('fetch-room')


})

socket.on('update-room', ({ roomList }) => {
    roomContainer.innerHTML = ' '
    for (let room of roomList) {

        displayRoom(room.id, room.roomName, room.players)
    }


})
// createBtn.addEventListener('click', async (e) => {
//     // e.preventDefault()
//     // const form = e.target
//     // const content = form.text.value

//     const roomData = new roomData()

//     const res = await fetch('/lobby', {
//         method: "POST",
//         body: roomData
//     })

//     if (res.status === 200) {
//         loadRooms()
//     }

// })