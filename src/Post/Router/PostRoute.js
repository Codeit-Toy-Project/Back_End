const express = require('express');
const router = express.Router();
const PostController = require('../Controller/PostController'); 

// 게시글 등록
router.post('/api/groups/:groupId/posts', PostController.CreatePost);

// 그룹에 해당하는 게시글 목록 조회
router.get('/api/groups/:groupId/posts', PostController.GetPostsByGroupIdAndSort);

//제목 또는 태그로 검색
//router.get('/api/groups/:groupId/posts', PostController.SearchPosts);

// 게시글 수정
router.put('/api/posts/:postId', PostController.UpdatePost);

// 게시글 삭제
router.delete('/api/posts/:postId', PostController.DeletePost);

// 게시글 상세 조회
router.get('/api/posts/:postId', PostController.GetPostBypostId);

// 게시글 공감하기
router.post('/api/posts/:postId/like',PostController.LikePost);

//게시글 조회 권한
router.post('/api/posts/:postId/verify-password',PostController.IsVerifyPassword);

//게시글 공개여부
router.get('/api/posts/:postId/is-public',PostController.IsPostPublic);

module.exports = router; 