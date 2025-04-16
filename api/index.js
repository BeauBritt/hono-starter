// src/index.js
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { MongoClient } from 'mongodb'
import { config } from 'dotenv'
import { userRoutes } from './userRoutes.js'

config()

const app = new Hono()

app.use('*', cors({ origin: '*', credentials: true }))

const mongoUrl = process.env.url
const client = new MongoClient(mongoUrl)
const db = client.db('CBPacks')
const playerCollection = db.collection('Player Data')

// Register user routes
app.route('/user', userRoutes)

// Base route
app.get('/', async (c) => {
  const players = await playerCollection.find({}, { projection: { _id: 0 } }).toArray()
  return c.json(players)
})

// Get 5 random players
app.get('/random_players', async (c) => {
  const players = await playerCollection.find({}, { projection: { _id: 0 } }).toArray()
  const shuffled = players.sort(() => 0.5 - Math.random())
  return c.json(shuffled.slice(0, 5))
})

export default app
