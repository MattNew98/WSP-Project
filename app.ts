import express from 'express'
import http from 'http'
import { Server as SocketIO } from 'socket.io'
import expressSession from 'express-session'

declare module 'express-session' {
    interface SessionData {
        name?: string
        isloggedin?: boolean
    }
}

export const app = express()
const server = new http.Server(app)
export const io = new SocketIO(server)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
    expressSession({
        secret: 'drawSomethingSecret',
        resave: true,
        saveUninitialized: true,
    }),
)

declare module 'express-session' {
    interface SessionData {
        username?: string
        isLoggedIn?: boolean
        age?: number

    }
}






app.use(express.static('public'))


app.use((req, res) => {
    res.redirect('/404.html')
})


app.listen(8080, () => {
    console.log('Listening on port 8080')
})
