
const Post = require('../Model/PostModel');
const PostService = require('../Service/PostService');


//###
const multer = require('multer');
const path = require('path');

// 이미지 저장 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // 이미지 저장 경로
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // 파일 이름 설정
    }
});

const upload = multer({ storage: storage });

// 이미지 업로드 API 수정
exports.uploadImage = [
    upload.single('image'), // 미들웨어로 multer 설정 추가
    (req, res) => {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const imageUrl = `/uploads/${req.file.filename}`; // 이미지 URL 생성
        return res.status(201).json({ imageUrl }); // 이미지 URL 응답
    }
];




// 이미지 및 게시글 동시 업로드 처리
exports.CreatePost = [
    upload.single('image'), // 이미지 업로드 미들웨어 추가
    async (req, res) => {
        try {
            const { groupId } = req.params;
            const { nickname, title, content, tags, location, memoryMoment, isPostPublic, postPassword } = req.body;
          
            let imageUrl = null;

            // 이미지 파일이 있는 경우 URL 생성
            if (req.file) {
                imageUrl = `/uploads/${req.file.filename}`;
            }

            const postData = { 
                ...req.body, 
                groupId, 
                image: imageUrl // 이미지 URL을 게시글 데이터에 포함
            };

        // const postData = { ...req.body, groupId}

        // 현재 최대 postId 조회
        const lastPost = await PostService.getLastPostId();
        postData.postId = lastPost ? lastPost.postId + 1 : 1; // 마지막 postId가 있으면 +1, 없으면 1


        const savedPost = await PostService.createPost(postData); // 게시글 저장
        return res.status(201).json(savedPost); // 성공 응답
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error }); // 서버 오류 응답
    }
}
];

// 게시글 수정
exports.UpdatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { title, content, postPassword} = req.body; 
        
        console.log(postId);
        console.log(postPassword);

        const post = await PostService.getPostBypostId(postId); // 게시글 조회

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
          }
        
        if(post.postPassword === postPassword){
            const updateData = {title, content, postPassword};
            
            const updatedPost = await PostService.updatePost(postId, updateData)
            return res.status(201).json(updatedPost)
        }
        
        else if (post.postPassword !== postPassword){
            return res.status(403).json({ error: 'Incorrect password' });
        }
        // if (!updatedPost) return res.status(404).json({ message: 'Post not found' });
        // res.json(updatedPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


// 게시글 삭제
exports.DeletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { postPassword } = req.body;
        
        const post = await PostService.getPostBypostId(postId);
        // console.log(postId);
        // console.log( postPassword);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
       
        if (post.postPassword !== postPassword) {
            return res.status(403).json({ error: 'Incorrect password' });
        }
        
        await PostService.deletePost(postId);
        return res.status(200).json({ message: 'Post deleted successfully' });
        } 
        
    catch (error) {
          res.status(500).json({ error: 'Error deleting post' });
        }
};

//postId로 게시글 상세 정보 조회
exports.GetPostBypostId = async (req,res) => {
    const { postId } = req.params;;

    try{
        const onlypost = await PostService.getPostBypostId(postId);
        
        if(!onlypost){
            return res.status(404).json({ message: 'Post not found' });
        }

        return res.status(200).json(onlypost);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error }); // 서버 오류 응답
    }

}


// 그룹 내 게시글 목록 조회
exports.GetPostsByGroupIdAndSort = async (req, res) => {
    const { groupId } = req.params; // URL에서 groupId 가져오기
    const { sortBy } = req.query; // 쿼리 파라미터로 정렬 기준 가져오기
    const { searchQuery } = req.query; // 쿼리 파라미터로 검색어 받기
    console.log(sortBy, searchQuery);

    try {
        const sortField = sortBy || 'createdAt'; // 기본값 설정
        // 그룹 ID와 정렬 기준이 없으면 오류 응답
        if (!groupId) {
            return res.status(400).json({ message: 'Group ID is required' });
        }

        // 게시글 목록 조회 및 정렬
        const posts = await PostService.getPostsByGroupIdAndSort(groupId, sortField, searchQuery);


        // 게시글이 없으면 404 응답
        if (posts.length === 0) {
            return res.status(404).json({ message: 'No posts found' });
        }
        return res.json(posts); // 검색된 게시글 반환

    } catch (error) {
        return res.status(500).json({ message: 'Server error', error }); // 서버 오류 응답
    }
};


//  //제목 또는 태그로 검색
//  exports.SearchPosts = async (req, res) => {
//     const { searchQuery } = req.query; // 쿼리 파라미터로 검색어 받기
//     console.log(searchQuery);

//     try {
//         // 검색어가 없으면 전체 게시글 반환
//         if (!searchQuery) {
//             return res.status(400).json({ message: 'Search query is required' });
//         }

//         // 검색 결과 반환
//         const posts = await PostService.searchPosts(searchQuery);
        
//         if (posts.length === 0) {
//             return res.status(404).json({ message: 'No posts found' });
//         }

//         return res.status(200).json(posts);

//     } catch (error) {
//         return res.status(500).json({ message: 'Server error', error });
//     }
// };

  


// 게시글 공감하기 (like)
exports.LikePost = async (req, res) => {
    const { postId } = req.params;
    try {
        if (!postId) return res.status(404).json({ message: 'Post not found' });

        const lovePost = await PostService.likePost(postId);
        res.status(200).json(lovePost)

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



// 게시글 공개 여부 확인
exports.IsPostPublic = async (req, res) => {
    const { postId } = req.params; // URL에서 postId 가져오기
    console.log(postId);
    try {
        const isPublic = await PostService.isPostPublic(postId); // 게시글 공개 여부 확인
        return res.json({ isPublic }); // 공개 여부 반환
    } catch (err) {
        return res.status(404).json({ message: err.message }); // 에러 발생 시 404 응답
    }
};


 //게시글 조회 권환 여부 확인
 exports.IsVerifyPassword = async (req, res) => {
    try{
        const { postId } = req.params; 
        const { password } = req.body; 
        const IsVerify = await PostService.isVerifyPassword(postId, password)
        return res.status(200).json(IsVerify)
    }
    catch (err) {
    return res.status(404).json({ message: err.message }); // 에러 발생 시 404 응답
    }
};




 
