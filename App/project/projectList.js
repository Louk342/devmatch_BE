const express = require('express');
const router = express.Router();
const db = require('../db'); // db.js 파일을 통해 데이터베이스 연결

// 최근 5개의 프로젝트를 반환하는 엔드포인트 (프로젝트 이름, 설명, 기술 스택 포함)
router.get('/projectList', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.project_id,
                p.project_name,
                p.description,
                COALESCE(
                    JSON_ARRAYAGG(ts.name),
                    JSON_ARRAY()
                ) AS tech_stacks
            FROM Project p
            LEFT JOIN Project_Stack ps ON p.project_id = ps.project_id
            LEFT JOIN TechStack ts ON ps.stack_id = ts.stack_id
            GROUP BY p.project_id
            ORDER BY p.created_at DESC
            LIMIT 5;
        `;
        const [rows] = await db.query(query);

        // JSON 문자열을 배열로 파싱하여 처리
        const projects = rows.map(project => ({
            project_id: project.project_id,
            project_name: project.project_name,
            description: project.description,
            tech_stacks: JSON.parse(project.tech_stacks) // 문자열을 배열로 파싱
        }));

        res.status(200).json(projects);
    } catch (error) {
        console.error('프로젝트 리스트 가져오기 오류:', error);
        res.status(500).json({ error: '프로젝트 리스트를 가져오는 중 오류가 발생했습니다.' });
    }
});

module.exports = router;
