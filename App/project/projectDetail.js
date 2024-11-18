const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/projectDetail', async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Project ID parameter is required' });
    }

    try {
        const query = `
            SELECT 
                p.project_id, 
                p.project_name, 
                p.description, 
                p.required_developers,
                p.required_designers,
                p.required_planners,
                p.created_at,
                ps.stack_id 
            FROM 
                Project p
            LEFT JOIN 
                Project_Stack ps ON p.project_id = ps.project_id
            WHERE 
                p.project_id = ?
        `;
        const [results] = await db.query(query, [id]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // 프로젝트 정보를 그룹화하여 스택 ID를 배열로 묶기
        const projectDetail = {
            project_id: results[0].project_id,
            project_name: results[0].project_name,
            description: results[0].description,
            required_developers: results[0].required_developers,
            required_designers: results[0].required_designers,
            required_planners: results[0].required_planners,
            created_at: results[0].created_at,
            stack_id: []
        };

        results.forEach(row => {
            if (row.stack_id) {
                projectDetail.stack_id.push(row.stack_id);
            }
        });

        res.status(200).json(projectDetail);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the project details' });
    }
});

module.exports = router;
