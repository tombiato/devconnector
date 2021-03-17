import express from 'express';
import connectDB from './config/db.js';

// Routers Imports
import { router as usersRouter } from './routes/api/users.js';
import { router as authRouter } from './routes/api/auth.js';
import { router as profileRouter } from './routes/api/profile.js';
import { router as postsRouter } from './routes/api/posts.js';

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API running'));

// Define Routes
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/posts', postsRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT), () => console.log(`Server started on port: ${PORT}`);
