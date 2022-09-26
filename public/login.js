// CHANGE IP BEFORE OPEN SERVER!!!!! // "192.168.59.61:8080" "localhost:8080"
let SERVER_IP = "localhost:8080"
login()
async function login() {

    const loginForm = document.querySelector('#login-form')

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        const form = e.target
        const username = form.username.value
        const password = form.password.value
        // console.log(username, password)
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
        if (res.status == 401) {
            alert("Invalid username or password! Please try again.")
        }
        if (res.status == 400) {
            alert("You have been logged in, please check other browser!")
        }

    })

}

register()
async function register() {

    const registerForm = document.querySelector('#register-form')

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
            window.location = `/lobby.html`
        }
    })

}
// let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
//     ranNums = [],
//     i = topicAmount,
//     j = 0;

// while (i--) {
//     j = Math.floor(Math.random() * (i + 1));
//     ranNums.push(nums[j]);
//     nums.splice(j, 1);
// }
// console.log(nums)
// console.log(ranNums)

let topicAmount = 4
let ranNums = []
while (ranNums.length < topicAmount) {
    j = Math.floor(Math.random() * (6)); //change total number of topics
    if (!ranNums.includes(j)) {
        ranNums.push(j);
    }
}