require('dotenv').config({ path: '../.env' });
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// MariaDB 세션 스토어 설정
const sessionStore = new MySQLStore({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// 세션 미들웨어 설정
app.use(session({
    key: 'session_cookie_name',
    secret: process.env.SESSION_SECRET, // .env에서 시크릿 키를 가져옴
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24시간 후 만료
        httpOnly: true,
        secure: false // HTTPS 사용 시 true
    }
}));

// 회원가입 엔드포인트
app.post('/doSignup', [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('role').isIn(['Developer', 'Designer', 'Planner']).withMessage('Invalid role'),
    body('grade').isIn(['1', '2', '3', '4', 'Graduate']).withMessage('Invalid grade')
], async (req, res) => {
    // 요청 검증 결과 확인
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, email, role, grade } = req.body;

    try {
        // 비밀번호 암호화
        const hashedPassword = await bcrypt.hash(password, 12);

        // DB에 사용자 정보 추가
        const query = `
            INSERT INTO User (username, password, email, role, grade)
            VALUES (?, ?, ?, ?, ?)
        `;
        await db.query(query, [username, hashedPassword, email, role, grade]);

        res.status(201).send({ message: 'User successfully registered' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'An error occurred while registering the user' });
    }
});

// 로그인 엔드포인트
app.post('/doLogin', [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    // 요청 검증 결과 확인
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // 이메일을 통해 사용자 찾기
        const [rows] = await db.query('SELECT * FROM User WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).send({ error: 'Invalid email or password' });
        }

        const user = rows[0];

        // 비밀번호 검증
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send({ error: 'Invalid email or password' });
        }

        // 세션에 사용자 정보 저장
        req.session.userId = user.user_id;
        req.session.username = user.username;

        res.status(200).send({ message: 'Login successful', user: { user_id: user.user_id, username: user.username, email: user.email } });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'An error occurred while logging in' });
    }
});

// 로그아웃 엔드포인트
app.post('/doLogout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send({ error: 'An error occurred while logging out' });
        }
        res.clearCookie('session_cookie_name');
        res.status(200).send({ message: 'Logout successful' });
    });
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
