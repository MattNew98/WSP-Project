import express from 'express'
import { client } from '../app'
import { checkPassword, hashPassword } from '../hash'
import fetch from 'cross-fetch'
import crypto from 'crypto'

export const lobbyRoutes = express.Router()


lobbyRoutes.post('/', async (req, res) => {
    try {
        const userName = await 




    }

}