const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../db');

router.post('/projectUpload', [
    body('project_name').notEmpty().withMessage('Project name is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('required_developers').isInt({ min: 0 }).withMessage('Required developers must be a non-negative integer'),
    body('required_designers').isInt({ min: 0 }).withMessage('Required designers must be a non-negative integer'),
    body('required_planners').isInt({ min: 0 }).withMessage('Required planners must be a non-negative integer'),
    body('stack_ids').isArray({ min: 1 }).withMessage('Stack IDs must be an array with at least one element')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { project_name, description, required_developers, required_designers, required_planners, stack_ids } = req.body;

    try {
        // 트랜잭션 시작
        const connection = await db.getConnection();
        await connection.beginTransaction();

        // 프로젝트 삽입
        const query = `
            INSERT INTO Project (project_name, description, required_developers, required_designers, required_planners)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await connection.query(query, [project_name, description, required_developers, required_designers, required_planners]);
        const projectId = result.insertId;

        // Project_Stack 테이블에 stack_id 삽입
        const stackInsertQuery = `
            INSERT INTO Project_Stack (project_id, stack_id)
            VALUES (?, ?)
        `;
        for (const stackId of stack_ids) {
            await connection.query(stackInsertQuery, [projectId, stackId]);
        }

        // 트랜잭션 커밋
        await connection.commit();
        connection.release();

        res.status(201).send({ message: '프로젝트 업로드 성공' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: '프로젝트 업로드 중 오류발생' });
    }
});

module.exports = router;
