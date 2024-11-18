const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../db');
const bcrypt = require('bcrypt');

router.post('/doSignup', [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('role').isIn(['Developer', 'Designer', 'Planner']).withMessage('Invalid role'),
    body('grade').isIn(['1', '2', '3', '4', 'Graduate']).withMessage('Invalid grade'),
    body('university').optional().isString().withMessage('University must be a string'),
    body('profile_info').optional().isString().withMessage('Profile information must be a string')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, email, role, grade, university, profile_info } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `INSERT INTO User (username, password, email, role, grade, university, profile_info) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        await db.query(query, [username, hashedPassword, email, role, grade, university, profile_info]);
        res.status(201).send({ message: '회원가입 완료' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: '회원가입 오류' });
    }
});

module.exports = router;
