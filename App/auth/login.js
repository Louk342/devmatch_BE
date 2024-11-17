const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../db');
const bcrypt = require('bcrypt');

router.post('/doLogin', [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const [rows] = await db.query('SELECT * FROM User WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).send({ error: 'Invalid email or password' });
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send({ error: 'Invalid email or password' });
        }

        req.session.userId = user.user_id;
        req.session.username = user.username;
        res.status(200).send({ message: 'Login successful', user: { user_id: user.user_id, username: user.username, email: user.email } });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'An error occurred while logging in' });
    }
});

module.exports = router;
