import express from 'express';
import { check, validationResult } from 'express-validator';
import config from 'config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import auth from '../../middleware/auth.js';
import User from '../../models/User.js';

export const router = express.Router();

// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get('/', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password');

		res.json({ user });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error...');
	}
});

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public
router.post(
	'/',
	[
		check('email', 'Please include a valid email').isEmail(),
		check('password', 'Password is required').exists(),
	],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty())
			return res.status(400).json({ success: false, errors: errors.array() });

		const { email, password } = req.body;

		try {
			let user = await User.findOne({ email });

			if (!user)
				return res
					.status(400)
					.json({ errors: [{ msg: 'Invalid Credentials' }] });

			const isMatch = await bcrypt.compare(password, user.password);

			if (!isMatch)
				return res
					.status(400)
					.json({ errors: [{ msg: 'Invalid Credentials' }] });

			const payload = { user: { id: user.id } };

			jwt.sign(
				payload,
				config.get('jwtSecret'),
				{ expiresIn: 360000 },
				(err, token) => {
					if (err) throw err;
					res.json({ token });
				}
			);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error...');
		}
	}
);
