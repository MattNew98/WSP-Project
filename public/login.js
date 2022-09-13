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