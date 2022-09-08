import express from 'express'
import { client } from '../app'
import { checkPassword, hashPassword } from '../hash'
import fetch from 'cross-fetch'
import crypto from 'crypto'

export const userRoutes = express.Router()

userRoutes.get('/', async (req, res) => {
	let userResult = await client.query('select * from users')
	res.json(userResult.rows)
})

userRoutes.post('/register', async (req, res) => {
	try {
		const username = req.body.username
		const password = req.body.password

		if (!username || !password) {
			res.status(400).json({
				message: 'Invalid username or password'
			})
			return
		}

		let hashedPasword = await hashPassword(password)
		await client.query(
			`insert into users (username, password) values ($1, $2)`,
			[username, hashedPasword]
		)
		res.json({ message: 'User created' })
	} catch (error) {
		console.log(error)
		res.status(500).json({ message: 'Internal server error' })
	}
})

userRoutes.post('/login', async (req, res) => {
	console.log('userRoutes - [/login]')
	const username = req.body.username
	const password = req.body.password

	if (!username || !password) {
		res.status(400).json({
			message: 'Invalid username or password'
		})
		return
	}

	let userResult = await client.query(
		`select * from users where username = $1`,
		[username]
	)
	let dbUser = userResult.rows[0]

	if (!dbUser) {
		res.status(400).json({
			message: 'Invalid username or password'
		})
		return
	}

	// compare password

	let isMatched = await checkPassword(password, dbUser.password)

	if (!isMatched) {
		res.status(400).json({
			message: 'Invalid username or password'
		})
		return
	}

	let {
		password: dbUserPassword,
		id,
		created_at,
		updated_at,
		...sessionUser
	} = dbUser
	req.session['user'] = sessionUser

	res.status(200).json({
		message: 'Success login'
	})
})

userRoutes.get('/logout', (req, res) => {
	req.session.destroy(() => {
		console.log('user logged out')
	})
	res.redirect('/')
})

userRoutes.get('/me', (req, res) => {
	res.json({
		message: 'Success retrieve user',
		data: {
			user: req.session['user'] ? req.session['user'] : null
		}
	})
})

userRoutes.get('/login/google', loginGoogle)

async function loginGoogle(req: express.Request, res: express.Response) {
	// 如果google in 成功，就會拎到 一個 access token
	// access token 係用黎換番google 既 user profile
	const accessToken = req.session?.['grant'].response.access_token

	// fetch google API, 拎 user profile
	const fetchRes = await fetch(
		'https://www.googleapis.com/oauth2/v2/userinfo',
		{
			method: 'get',
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		}
	)
	const googleProfile = await fetchRes.json()

	// check 下 db有無呢個user存在
	const users = (
		await client.query(`SELECT * FROM users WHERE username = $1`, [
			googleProfile.email
		])
	).rows
	let user = users[0]

	// 如果 user 不存在，馬上 create 一個
	if (!user) {
		//get a random 32 bit string
		const randomString = crypto.randomBytes(32).toString('hex')
		let hashedPassword = await hashPassword(randomString)
		// Create the user when the user does not exist
		user = (
			await client.query(
				`INSERT INTO users (username,password)
	            VALUES ($1,$2) RETURNING *`,
				[googleProfile.email, hashedPassword]
			)
		).rows[0]
	}

	// 最後當佢 login 成功處理
	// set google profile 入去 req session
	if (req.session) {
		req.session['user'] = googleProfile
	}
	res.redirect('/')
}
