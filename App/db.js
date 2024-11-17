require('dotenv').config({ path: '../.env' }); // .env 파일에서 환경 변수를 불러옴
const mysql = require('mysql2/promise');

// MariaDB 연결 풀 설정
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 100, // 연결 풀의 최대 연결 수
    queueLimit: 0 // 연결 대기열의 제한 (0은 무제한)
});

module.exports = db;
