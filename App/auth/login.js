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

        // 세션에 사용자 정보 저장
        req.session.userId = user.user_id;
        req.session.username = user.username;

        // 세션 저장 후 응답
        req.session.save(err => {
            if (err) {
                console.error('세션 저장 에러:', err);
                return res.status(500).send({ error: '세션 저장 중 오류가 발생했습니다.' });
            }
            res.status(200).send({
                message: '로그인 성공',
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    email: user.email
                }
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: '로그인 에러' });
    }
});

module.exports = router;
