import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { MongoClient } from 'mongodb'
import { config } from 'dotenv'

config()

const mongoUrl = process.env.url
const client = new MongoClient(mongoUrl)
const db = client.db('CBPacks')
const userCollection = db.collection('Users')

export const userRoutes = new Hono()

// Schema for validation
const authSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

// Register Route
userRoutes.post('/register', zValidator('json', authSchema), async (c) => {
  const { username, password } = await c.req.json()

  const existingUser = await userCollection.findOne({ username })
  if (existingUser) {
    return c.json({ error: 'Username already exists' }, 400)
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await userCollection.insertOne({
    username,
    password: hashedPassword,
  })

  return c.json({ message: 'User registered successfully' }, 201)
})

// Login Route
userRoutes.post('/login', zValidator('json', authSchema), async (c) => {
  const { username, password } = await c.req.json()

  const user = await userCollection.findOne({ username })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return c.json({ error: 'Invalid username or password' }, 401)
  }

  return c.json({ message: 'Login successful', username }, 200)
})
