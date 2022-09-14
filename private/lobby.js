async function getProfile() {
    const res = await fetch('/user/me')
    const result = await res.json()
    console.log(result.data.user)
    if (result.data.user.name) {
        document.querySelector('.user-name').innerHTML = `Welcome ${result.data.user.name} !!!`
        document.querySelector('.user-icon').innerHTML = `<img src="${result.data.user.picture}">`
    } else {
        document.querySelector('.user-name').innerHTML = `Welcome !!!`
    }
}

getProfile()

//// Create a new room

async function loadRooms() {
    const res = await fetch()
    const data = await res.json()
    if (res.ok) {
        let html = ''
        let room = 0
        for (let room of data) {
            html += `<a class="room" href="game.html">
            <p>Room ${room}</p>
            <div class="room-button">
            <i class="fa-solid fa-person-dress"></i>
            <i class="fa-sharp fa-solid fa-trophy"></i>
            </div>
            </a>`
        }
        const roomContainer = document.querySelector('.room-container')
        roomContainer.innerHTML = html


    }
}
const createBtn = document.querySelector(".create-room-btn")
createBtn.addEventListener('click', async (e) => {
            // e.preventDefault()
            // const form = e.target
            // const content = form.text.value

            const roomData = new roomData()

            const res = await fetch('/lobby', {
                method: "POST",
                body: roomData
            })

            if (res.status === 200) {
                loadRooms()
            }

        })