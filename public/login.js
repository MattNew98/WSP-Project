// CHANGE IP BEFORE OPEN SERVER!!!!! // "192.168.59.61:8080" "localhost:8080"
let SERVER_IP = "localhost:8080"
login()
async function login() {

    const loginForm = document.querySelector('#login-form')
    console.log(loginForm)

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        const form = e.target
        const username = form.username.value
        const password = form.password.value
        console.log(username, password)
        const res = await fetch('/user/login', {
            method: "POST",
            body: JSON.stringify({
                username,
                password
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        })
        if (res.ok) {
            window.location = `/lobby.html`
        }
        if (res.status == 400) {
            alert("Invalid username or password! Please try again.")
        }

    })

}

register()
async function register() {

    const registerForm = document.querySelector('#register-form')
    console.log(registerForm)

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        const form = e.target
        const registerUsername = form.registerUsername.value
        const registerPassword = form.registerPassword.value
        const registerImage = form.userImage.files[0]

        const formData = new FormData()
        formData.append('registerUsername', registerUsername)
        formData.append('registerPassword', registerPassword)
        formData.append('image', registerImage)


        const res = await fetch('/user/register', {
            method: "POST",
            body: formData
        })
        if (res.status == 400) {
            alert("Invalid username/password or username already registered")
        }
        if (res.status == 200) {
            alert("Registered successful")
        }
    })

}