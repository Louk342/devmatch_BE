const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/projectSearch', async (req, res) => {
    const { title } = req.query;

    if (!title) {
        return res.status(400).json({ error: 'Title parameter is required' });
    }

    try {
        const query = `
            SELECT 
                p.project_id, 
                p.project_name, 
                p.description, 
                ps.stack_id 
            FROM 
                Project p
            LEFT JOIN 
                Project_Stack ps ON p.project_id = ps.project_id
            WHERE 
                p.project_name LIKE ?
        `;
        const [results] = await db.query(query, [`%${title}%`]);

        if (results.length === 0) {
            return res.status(404).json({ message: '프로젝트가 없습니다' });
        }

        // 프로젝트 정보를 그룹화하여 스택 ID를 배열로 묶기
        const projectMap = {};
        results.forEach(row => {
            if (!projectMap[row.project_id]) {
                projectMap[row.project_id] = {
                    project_id: row.project_id,
                    project_name: row.project_name,
                    description: row.description,
                    stack_id: []
                };
            }
            projectMap[row.project_id].stack_id.push(row.stack_id);
        });

        // 객체를 배열로 변환하여 반환
        const formattedResults = Object.values(projectMap);

        res.status(200).json(formattedResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '프로젝트 검색중 오류가 발생했습니다' });
    }
});

module.exports = router;

//GET http://devmatch.ddns.net/project/projectSearch?title=example
