// routes/commentsRouter.js
const express = require('express');
const CommentController = require('../Controller/CommentController');
const router = express.Router();

// 1. 댓글 등록
router.post('/api/posts/:postId/comments', CommentController.createComment);

// 2. 댓글 목록 조회
router.get('/api/posts/:postId/comments', CommentController.getComments);

// 3. 댓글 수정
router.put('/api/comments/:commentId', CommentController.updateComment);

// 4. 댓글 삭제
router.delete('/api/comments/:commentId', CommentController.deleteComment);

module.exports = router;
