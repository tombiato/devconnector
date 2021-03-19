import express from 'express';
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
