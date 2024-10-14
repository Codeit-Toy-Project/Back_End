// controllers/commentsController.js
const Comment = require('../Model/CommentModel');
const Post = require('../../Post/Model/PostModel');

// 1. 댓글 등록
exports.createComment = async (req, res) => {
  try {
    const { nickname, content, commentPassword } = req.body;
    const { postId } = req.params;

    const Ispost = await Post.findOne({postId: postId});
    if(!Ispost){
        res.status(404).json({ message: '게시글이 없습니다.'})
    }

    const newComment = new Comment({ 
        nickname, content, commentPassword, 
        postId: Ispost.postId });

    // 고유한 commentId 생성
    const lastComment = await Comment.findOne().sort({ commentId: -1 }).select('commentId').exec();
    newComment.commentId = lastComment ? lastComment.commentId + 1 : 1; // 마지막 commentId + 1

    await newComment.save();
    res.status(201).json({ message: '댓글이 등록되었습니다.', comment: newComment });
  
} catch (error) {
    res.status(400).json({ error: '댓글 등록에 실패했습니다.' });
  }
};

// 2. 댓글 목록 조회
exports.getComments = async (req, res) => {
  const { postId } = req.params;
  console.log(postId);

  try {
    const comments = await Comment.find({ postId: postId })
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: '댓글 목록 조회에 실패했습니다.' });
  }
};

// 3. 댓글 수정
exports.updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { content,  commentPassword } = req.body;

  try {
    const comment = await Comment.findOne({commentId: commentId });
    
    if (comment.commentPassword !==  commentPassword) {
      return res.status(403).json({ error: '비밀번호가 일치하지 않습니다.' });
    }
    

    await Comment.findOneAndUpdate({commentId: commentId },{content: content});
    res.status(200).json({ message: '댓글이 수정되었습니다.', comment });
  } catch (error) {
    res.status(400).json({ error: '댓글 수정에 실패했습니다.' });
  }
};

// 4. 댓글 삭제
exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const { commentPassword } = req.body;

  try {
    const comment = await Comment.findOne({commentId: commentId });
    
    if (comment.commentPassword !== commentPassword) {
      return res.status(403).json({ error: '비밀번호가 일치하지 않습니다.' });

    }

    await Comment.deleteOne({ commentId: commentId });
    res.status(200).json({ message: '댓글이 삭제되었습니다.' });
  } catch (error) {
    res.status(400).json({ error: '댓글 삭제에 실패했습니다.' });
  }
};
