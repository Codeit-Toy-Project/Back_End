const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer'); // 파일 업로드를 위한 multer
const path = require('path'); // 경로 처리
const PostRoute = require('./src/Post/Router/PostRoute'); // 게시글 관련 라우트

const app = express();

mongoose.connect('mongodb://localhost:27017/memoryDB')
  .then(() => console.log('MongoDB 연결 성공!'))
  .catch(err => console.error('MongoDB 연결 실패:', err));

// 미들웨어 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 정적 파일 제공
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// 라우트 설정
//app.use(PostRoute); // 게시글 관련 라우트를 사용
app.use(PostRoute);

// // 기본 헬스 체크 엔드포인트
// app.get('/', (req, res) => {
//     res.send('API is running...');
// });

// 서버 실행
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});




//const uri = "mongodb+srv://010tntnf:<UpEXwqcJusclFvDw>@cluster0.9h2sj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";