// services/postService.js
const Post = require('../Model/PostModel');

const PostService = {
    
    //게시글 생성
    createPost: async (postData) => {
        const post = new Post(postData);
        return await post.save();
    },

    // 마지막 postId 조회
    getLastPostId: async () => {
        return await Post.findOne().sort({ postId: -1 }).select('postId').exec(); // 최대 postId를 가진 문서 조회
    },

    // 게시글 수정
    updatePost: async (postId, updateData) => {
        const updatedPost = await Post.findOneAndUpdate(
            { postId: postId },  // 조건 객체
            updateData,          // 업데이트할 데이터
            { new: true }        // 업데이트 후의 값을 반환
          );

        if (!updatedPost) {
            throw new Error('Post not found'); // 게시글이 없는 경우 에러 발생
        }
        return updatedPost; // 수정된 게시글 반환
    },

    // 게시글 삭제
    deletePost: async (postId) => {
        const deletedPost = await Post.findOneAndDelete({postId: postId});
        if (!deletedPost) {
            throw new Error('Post not found'); // 게시글이 없는 경우 에러 발생
        }
    },

    // postId로 게시글 조회
    getPostBypostId: async (postId) => {
        const post = await Post.findOne({ postId: postId });
        return post; // 게시글 반환
    },

    //게시글 목록 조회 & 제목 또는 태그로 검색
    getPostsByGroupIdAndSort: async (groupId, sortBy, searchQuery) => {
        
        // 기본 쿼리 생성
        const query = {
            groupId: groupId,
            isPostPublic: true
        };

        // 검색어가 제공된 경우 정규 표현식 추가
        if (searchQuery && searchQuery.trim() !== '') {
            query.$or = [
                { title: { $regex: searchQuery, $options: 'i' } },
                { tags: { $elemMatch: { $regex: searchQuery, $options: 'i' } } }
            ];
        }
        // 게시글 조회 및 정렬
        const posts = await Post.find(query).sort({ [sortBy]: -1 });
        return posts; // 게시글 반환
        },


    //  //제목 또는 태그로 검색
    //  searchPosts: async (searchQuery) => {
    //     return await Post.find({
    //         $or: [
    //             { title: { $regex: searchQuery, $options: 'i' } },
    //             { tags: { $regex: searchQuery, $options: 'i' } }
    //         ]
    //     });
    // },


    // 게시글 공감
    likePost: async (postId) => {
        const lovedPost = await Post.findOneAndUpdate(
            { postId: postId }, // 조건: postId가 주어진 postId와 일치하는 문서
            { $inc: { likes: 1 } }, // likes 필드를 1 증가시키는 업데이트
            { new: true } // 업데이트된 문서를 반환
          );
        
        if (!lovedPost) {
            throw new Error('Post not found'); // 게시글이 없는 경우 에러 발생
        }
        return lovedPost; // 공감한 게시글 반환
    },
    
    //게시글 공개 여부 확인
    isPostPublic: async (postId) => {
        const post = await Post.findOne({postId: postId}); // 게시글 ID로 게시글 조회
        
        if (!post) {
            throw new Error('Post not found'); // 게시글이 없는 경우 에러 발생
        }
        return post.isPostPublic; // 게시글의 공개 여부 반환

    },


     //게시글 조회 권환 여부 확인
    isVerifyPassword: async (postId,password)=> {
        const post = await Post.findOne({postId: postId});
        
        if(post.password === password){
            return true;
        }
        else{
            return false;
        }
        
    }
};

module.exports = PostService;
