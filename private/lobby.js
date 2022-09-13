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