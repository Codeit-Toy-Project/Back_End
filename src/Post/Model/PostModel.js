// models/postModel.js - 게시판 게시글 모델
//import mongoose from 'mongoose';
const mongoose = require('mongoose');
const multer = require('multer');


// 게시판의 게시글 스키마 정의
const postSchema = new mongoose.Schema({
    
    nickname :{
        type: String,
        required: true
    },

    title: {
        type: String,
        required: true
    },
    
    image: {
        type: String, //이미지 경로 저장, 파일이 아니라 경로
        required: true
    },

    content: {
        type: String,
        required: true
    },

    tags: {
        type: [String],
        required: true
    },

    location: {
        type: String,
        required: true
    },

    memoryMoment: {
        type: Date
    },

    isPostPublic: {
        type: Boolean,
        required: true
    },

    postPassword: {
        type: String,
        required: true
    },

    likes: {
        type: Number,
        default: 0
    },

    commentCounts: {
        type: Number,
        default: 0
    },

    groupId: {
        type: Number,
        ref: 'Group' , // 그룹과의 연관성
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    postId: {
        type: Number, // 숫자형 ID
        unique: true, // 중복 방지
        required: true,
        default: 1
    }

});

// 스키마를 기반으로 모델 생성
const Post = mongoose.model('Post', postSchema);
module.exports = Post; // 다른 파일에서 사용할 수 있도록 내보냄
