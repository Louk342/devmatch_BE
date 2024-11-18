require('dotenv').config({ path: './.env' });
const cors = require('cors');
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const app = express();
app.use(express.json());

const PORT = 2000;

// MariaDB 세션 스토어 설정
const sessionStore = new MySQLStore({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// 세션 미들웨어 설정
app.use(session({
    key: 'devmatch',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: false,
    }
}));

app.get('/checkSession', (req, res) => {
    if (req.session.userId) {
        res.status(200).send({
            user: {
                user_id: req.session.userId,
                username: req.session.username
            }
        });
    } else {
        res.status(401).send({ message: 'Not authenticated' });
    }
});

// 라우터 설정
app.use('/auth', require('./auth/signup'));
app.use('/auth', require('./auth/login'));
app.use('/auth', require('./auth/logout'));

app.use('/project', require('./project/projectUpload'));
app.use('/project', require('./project/applyToProject'));

app.use('/project', require('./project/projectSearch'));
app.use('/project', require('./project/projectDetail'));

// CORS 미들웨어
app.use(cors({
    origin: true, // 프런트엔드가 실행되는 출처
    credentials: true // 쿠키 및 인증 정보를 포함하는 요청을 허용
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});


// 서버 실행
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
