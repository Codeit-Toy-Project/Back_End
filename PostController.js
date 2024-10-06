
const Post = require('../Model/PostModel');
const PostService = require('../Service/PostService');

// 게시글 등록
exports.CreatePost = async (req, res) => {
    try {
        const { groupId } = req.params;
        const {nickname, title, image ,content, tags, location, memoryMoment, isPostPublic, postPassword} = req.body;
            
        // // 10진수 ID를 ObjectId로 변환
        // const groupIdObjectId = groupId.toString(16);
        // console.log(groupIdObjectId);

        // 10진수 ID를 숫자로 변환한 후 16진수로 변환
        const groupIdObjectId = parseInt(groupId, 10).toString(16).toUpperCase(); // 대문자로 변환

        console.log(groupIdObjectId); // 16진수로 변환된 groupId 출력

        const postData = { ...req.body, groupIdObjectId}
        
        // const { nickname, title, image, content, tags, location, memoryMoment, isPostPublic, postPassword } = req.body;
        // // groupId가 정의되어 있다고 가정
        // const postData = { nickname, title, image, content, tags, location, memoryMoment, isPostPublic, postPassword, groupId };
        const savedPost = await PostService.createPost(postData); // 게시글 저장
        return res.status(201).json(savedPost); // 성공 응답
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error }); // 서버 오류 응답
    }
};

// 게시글 수정
exports.UpdatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { postPassword} = req.body;
        const post = await PostService.getPostBypostId(postId); // 게시글 조회

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
          }
        
        if(post.postPassword === postPassword){
            const updateData = {title, content, password};
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
        const { password } = req.body;
        const post = await PostService.getPostBypostId(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
       
        if (post.password !== password) {
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
    const { postId } = req.params;
    try{
        const onlypost = await PostService.getPostById(postId);
       
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
    const { searchQuery } = req.query // 쿼리 파라미터로 검색어 받기

    try {
        // 그룹 ID와 정렬 기준이 없으면 오류 응답
        if (!groupId) {
            return res.status(400).json({ message: 'Group ID is required' });
        }
        
        const sortField = sortBy || 'createdAt'; // 기본값 설정
        
        // 게시글 목록 조회 및 정렬
        const posts = await postService.getPostsByGroupIdAndSort(groupId, sortBy);

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

//     try {
//         // 검색어가 없으면 전체 게시글 반환
//         if (!searchQuery) {
//             return res.status(400).json({ message: 'Search query is required' });
//         }

//         // 검색 결과 반환
//         const posts = await postService.searchPosts(searchQuery);
        
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
    console.log(postId);
    try {
        if (!postId) return res.status(404).json({ message: 'Post not found' });

        const lovePost = PostService.LikePost(postId);
        res.status(200).json(lovePost)

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



// 게시글 공개 여부 확인
exports.IsPostPublic = async (req, res) => {
    const { postId } = req.params; // URL에서 postId 가져오기
    try {
        const isPublic = await postService.isPostPublic(postId); // 게시글 공개 여부 확인
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
        return await PostService.isVerifyPasswordPost(postId, password)
    }
    catch (err) {
    return res.status(404).json({ message: err.message }); // 에러 발생 시 404 응답
    }
};




 
