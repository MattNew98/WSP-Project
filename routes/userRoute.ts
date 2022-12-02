// CHANGE IP BEFORE OPEN SERVER!!!!! // "192.168.59.61:8080" "localhost:8080"
let SERVER_IP = "localhost:8081"
import express from 'express'
import { client } from '../app'
import { checkPassword, hashPassword } from '../hash'
import fetch from 'cross-fetch'
import crypto from 'crypto'
import { formParse } from '../utils/upload'

export const userRoutes = express.Router()
export let loggedInUser: any = []

userRoutes.get('/', async (req, res) => {
	let userResult = await client.query('select * from users')
	res.json(userResult.rows)
})

userRoutes.post('/register', async (req, res) => {
	try {
		const data = await formParse(req)
		const newUsername = data.fields.registerUsername
		const newPassword = data.fields.registerPassword
		let newImage

		if (data.filename == null) {
			newImage = `icon${Math.floor(Math.random() * 6) + 1}.png`
		} else {
			newImage = data.filename
		}

		// cannot put <> in username

		let badUsername = newUsername.includes("<")

		if (badUsername) {
			res.status(400).json({
				message: 'I know what you are doing..'
			})
			return
		}


		if (!newUsername || !newPassword) {
			res.status(400).json({
				message: 'Invalid username or password'
			})
			return
		}
		let userResult = await client.query(
			`select * from users where username = $1`,
			[newUsername]
		)
		let dbUser = userResult.rows[0]
		if (dbUser) {
			res.status(400).json({
				message: 'user already exists'
			})
			return
		}

		let hashedPassword = await hashPassword(newPassword)

		let insertResult = await client.query(
			`insert into users (username, password, image) values ($1, $2, $3) returning *`,
			[newUsername, hashedPassword, newImage]
		)
		dbUser = insertResult.rows[0]
		console.log(newUsername + ' is registered and logged in')
		loggedInUser.push(newUsername)
		req.session['user'] = dbUser
		res.status(200).json({
			message: 'registered successfully'
		})
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'Internal server error' })
	}
})

userRoutes.post('/login', async (req, res) => {
	const username = req.body.username
	const password = req.body.password

	if (!username || !password) {
		res.status(401).json({
			message: 'Invalid username or password (no text typed)'
		})
		return
	}

	let userResult = await client.query(
		`select * from users where username = $1`,
		[username]
	)
	let dbUser = userResult.rows[0]

	if (!dbUser) {
		res.status(401).json({
			message: 'Invalid username or password (no such user)'
		})
		return
	}

	// let isLoggedIn = loggedInUser.includes(username)
	// if (isLoggedIn) {
	// 	console.log(`${username} try to login twice!!`)
	// 	res.status(400).json({
	// 		message: 'You have been logged in, please check other browser!'
	// 	})
	// 	return
	// }
	// compare password



	let isMatched = await checkPassword(password, dbUser.password)

	if (!isMatched) {
		res.status(401).json({
			message: 'Invalid username or password (wrong pw)'
		})
		return
	}

	let {
		password: dbUserPassword,
		created_at,
		updated_at,
		...sessionUser
	} = dbUser
	console.log(username + ' is logged in')
	loggedInUser.push(username)
	req.session['user'] = sessionUser
	req.session.username = username
	res.json({ "success": true })
})


userRoutes.get('/logout', (req, res) => {
	console.log(req.session.user.username + ' is logged out')
	let index = loggedInUser.indexOf(req.session.user.username);
	if (index > -1) { // only splice array when item is found
		loggedInUser.splice(index, 1); // 2nd parameter means remove one item only
	}
	req.session.destroy(() => { })

	if (SERVER_IP[0] == "l") {
		res.redirect(`/login.html`)
	} else {
		res.redirect(`http://${SERVER_IP}/login.html`)
	}
})

userRoutes.get('/me', async (req, res) => {
	let userResult = await client.query(
		`select * from users where id = $1`,
		[req.session.user.id]
	)
	let dbUser = userResult.rows[0]
	res.json(dbUser)
	// res.json({
	// 	message: 'Success retrieve user',
	// 	data: {
	// 		user: req.session['user'] ? req.session['user'] : null
	// 	}
	// })
})


userRoutes.get('/login/google', loginGoogle);


async function loginGoogle(req: express.Request, res: express.Response) {
	const accessToken = req.session?.['grant'].response.access_token;
	const fetchRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
		method: "get",
		headers: {
			"Authorization": `Bearer ${accessToken}`
		}
	});
	const googleProfile = await fetchRes.json();
	const users = (await client.query(`SELECT * FROM users WHERE users.username = $1`, [
		googleProfile.email])).rows;

	let user = users[0];


	if (!user) {
		// Create the user when the user does not exist
		const randomString = crypto.randomBytes(32).toString('hex');
		let hashedPassword = await hashPassword(randomString)
		user = (await client.query(`INSERT INTO users (username,password, image) 
                VALUES ($1,$2,$3) RETURNING *`,
			[googleProfile.name, hashedPassword, googleProfile.picture])).rows[0]
	}
	console.log(googleProfile.name + ' is logged in')
	if (req.session) {
		req.session['user'] = googleProfile
		req.session.username = googleProfile.name
	}
	if (SERVER_IP[0] == "l") {
		res.redirect(`/lobby.html`)
	} else {
		res.redirect(`http://${SERVER_IP}/lobby.html`)
	}
	return res.status(200)
}

