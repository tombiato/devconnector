import express from 'express';
import auth from '../../middleware/auth.js';
import { check, validationResult } from 'express-validator';

import Profile from '../../models/Profile.js';
import User from '../../models/User.js';

export const router = express.Router();

// @route   GET api/profile/me
// @desc    Get current users profil
// @access  Private
router.get('/me', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.user.id,
		}).populate('user', ['name', 'avatar']);

		if (!profile)
			return res.status(400).json({ msg: 'There is no profile for this user' });

		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error...');
	}
});

// @route   POST api/profile
// @desc    Create or update a user profil
// @access  Private
router.post(
	'/',
	[
		auth,
		[
			check('status', 'Status is required').not().isEmpty(),
			check('skills', 'Skills is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty())
			return res.status(400).json({ errors: errors.array() });

		const {
			company,
			website,
			location,
			bio,
			status,
			githubusername,
			skills,
			youtube,
			facebook,
			twitter,
			instagram,
			linkedin,
		} = req.body;

		// Build profile object
		const profileFields = {};
		profileFields.user = req.user.id;

		if (company) profileFields.company = company;
		if (website) profileFields.website = website;
		if (location) profileFields.location = location;
		if (bio) profileFields.bio = bio;
		if (status) profileFields.status = status;
		if (githubusername) profileFields.githubusername = githubusername;

		if (skills)
			profileFields.skills = skills.split(',').map(skill => skill.trim());

		// Build social object
		profileFields.social = {};

		if (youtube) profileFields.social.youtube = youtube;
		if (facebook) profileFields.social.facebook = facebook;
		if (twitter) profileFields.social.twitter = twitter;
		if (instagram) profileFields.social.instagram = instagram;
		if (linkedin) profileFields.social.linkedin = linkedin;

		try {
			let profile = await Profile.findOne({ user: req.user.id });

			if (profile) {
				// Update profile
				await Profile.findOneAndUpdate(
					{ user: req.user.id },
					{ $set: profileFields },
					{ new: true }
				);

				return res.json(profile);
			}

			// Create profile
			profile = new Profile(profileFields);

			await profile.save();

			res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error...');
		}
	}
);

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
	try {
		const profiles = await Profile.find().populate('User', ['name', 'avatar']);

		res.json(profiles);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error...');
	}
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user id
// @access  Public
router.get('/user/:user_id', async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.params.user_id,
		}).populate('User', ['name', 'avatar']);

		if (!profile) return res.status(400).json({ msg: 'Profile not found' });

		res.json(profile);
	} catch (err) {
		console.error(err.message);

		if (err.kind === 'ObjectId')
			return res.status(404).json({ msg: 'Profile not found' });

		res.status(500).send('Server Error...');
	}
});
