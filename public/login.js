login()
async function login() {
    
    const loginForm = document.querySelector('#login-form')
    console.log(loginForm)

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        const form  = e.target
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
            window.location = 'lobby.html'
            console.log("Login successful")
        }
    })
    
}

register()
async function register() {
    
    const registerForm = document.querySelector('#register-form')
    console.log(registerForm)

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        const form  = e.target
        const registerUsername = form.registerUsername.value
        const registerPassword = form.registerPassword.value
        console.log(registerUsername, registerPassword)
        const res = await fetch('/user/register', {
            method: "POST",
            body: JSON.stringify({
                registerUsername,
                registerPassword
            }),
            headers: {
                'Content-Type': 'application/json',   
            }
        })
        if (res.ok) {
            window.location = 'lobby.html'
            console.log("Login successful")
        }
    })
    
}