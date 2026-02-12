import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'Netflix users';
const jwtSecret = process.env.JWT_SECRET;

if (!uri) throw new Error('Missing MONGODB_URI');
if (!jwtSecret) throw new Error('Missing JWT_SECRET');

const client = new MongoClient(uri);
let usersCol;

async function init() {
  await client.connect();
  const db = client.db(dbName);
  usersCol = db.collection('users');

  // Indexes
  await usersCol.createIndex({ email: 1 }, { unique: true });

  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log('Auth server on port', port));
}
init().catch(err => {
  console.error('Failed to init server:', err);
  process.exit(1);
});

// Helpers
function createToken(user) {
  return jwt.sign({ sub: user._id.toString() }, jwtSecret, { expiresIn: '7d' });
}

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await usersCol.findOne({ _id: new ObjectId(payload.sub) }, { projection: { passwordHash: 0 } });
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    const exists = await usersCol.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await usersCol.insertOne({
      name,
      email,
      passwordHash,
      provider: 'local',
      createdAt: new Date()
    });

    const user = { _id: result.insertedId, name, email };
    const token = createToken(user);
    res.status(201).json({ token, user });
  } catch (e) {
    console.error('Signup error', e);
    res.status(500).json({ message: 'Internal error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

    const user = await usersCol.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const safe = { _id: user._id, name: user.name, email: user.email };
    const token = createToken(safe);
    res.json({ token, user: safe });
  } catch (e) {
    console.error('Login error', e);
    res.status(500).json({ message: 'Internal error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  // Stateless JWT: client just discards token
  res.status(204).end();
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: { _id: req.user._id, name: req.user.name, email: req.user.email } });
});
