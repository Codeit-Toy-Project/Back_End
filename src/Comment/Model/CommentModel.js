// models/Comment.js
const mongoose = require('mongoose'); 

const commentSchema = new mongoose.Schema({
  
  nickname: { 
    type: String, 
    required: true 
  },

  content: { 
    type: String, 
    required: true 
  },

  commentPassword: { 
    type: String, 
    required: true
  }, // 비밀번호는 안전한 방법으로 저장해야 합니다.
  
  postId: { 
    type: Number,
    ref: 'Post', 
    required: true
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  },

  commentId: {
    type: Number,
    unique: true, // 중복 방지
    required: true,
    default: 1
  }

});

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment; 
// 다른 파일에서 사용할 수 있도록 내보냄

