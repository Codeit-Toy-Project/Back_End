import express from 'express';
import mongoose from 'mongoose';
import Group from './Model/Group.js';

const express = require("express");

const app = express();

// JSON 형태의 요청 body를 파싱
app.use(express.json());
const port = 8080;

// 그룹 등록
app.post("/groups", async (req, res) => {
  const newGroup = await Group.create(req.body);
  req.statusCode(201).send(newGroup);
});

// 그룹 목록 조회
app.get("/groups", async (req, res) => {
  const page = Number(req.query.page) || 1; // number | 기본 정렬은 최신순
  const pageSize = Number(req.query.pageSize) || 30; // number
  const sortBy = req.query.sort || "latest"; // latest | mostPosted | mostLiked | mostBadge
  const keyword = req.query.keyword || ""; // string (검색어)
  const isPublic = req.query.isPublic; // boolean

  // 정렬 기준
  const sortOptions = {
    latest: { createdAt: "desc" },
    mostPosted: { postCount: "desc" },
    mostLiked: { likeCount: "desc" },
    mostBadge: { badgeCount: "desc" },
  };
  // 기본적으로 선택된 옵션은 latest
  const sortOptionSelected = sortOptions[sortBy] || sortOptions.latest;

  //
  const conditions = [];
  // 검색어
  if (keyword) {
    conditions.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { introduction: { $regex: keyword, $options: "i" } },
    ];
  }
  if (isPublic !== undefined) {
    conditions.isPublic = isPublic === "true";
  }
  if (req.query.id) {
    if (mongoose.Types.ObjectId.isValid(req.query.id)) {
      conditions._id = mongoose.Types.ObjectId(req.query.id);
    } else {
      return res.status(400).send({ error: "Invalid ObjectId format" });
    }
  }

  const itemCnt = await Group.documentCnt(conditions);
  const totalPages = Math.ceil(itemCnt / pageSize);

  const groups = await Group.find(conditions)
    .sort(sortOptionSelected)
    .skip((page - 1) * pageSize)
    .limit(pageSize);

  const response = {
    currentPage: page,
    totalPages: totalPages,
    totalItemCount: itemCnt,
    data: groups,
  };

  res.send(response);
});

// 그룹 수정
app.put("/groups/:id", async (req, res) => {
  const id = req.params.id;
  const { password, updateData } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ message: "잘못된 요청입니다" });
  }
  try {
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).send({ message: "존재하지 않습니다" });
    }
    if (group.password !== password) {
      return res.status(403).send({ message: "비밀번호가 틀렸습니다" });
    }
    Object.assign(group, updateData);
    await group.save();
    res.send(group);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// 그룹 삭제
app.delete("/groups/:id", async (req, res) => {
  const id = req.params.id;
  const { password } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ message: "잘못된 요청입니다" });
  }
  try {
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).send({ message: "존재하지 않습니다" });
    }
    if (group.password !== password) {
      return res.status(403).send({ message: "비밀번호가 틀렸습니다" });
    }
    await Group.findByIdAndDelete(id);
    res.send({ message: "그룹 삭제 성공" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// 그룹 상세 정보 조회
app.get('/groups/:id', async (req, res) => {
  const id = req.params.id;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: '잘못된 요청입니다' });
  }

  const group = await Group.findById(id);
  if (group) {
      group.createdAt = moment(group.createdAt).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
      res.send(group);
  } else {
      res.status(404).send({ message: '존재하지 않습니다' });
  }
});

// 그룹 조회 권한 확인
app.get("/groups/:id/verify-password", async (req, res) => {
  const id = req.params.id;
  const { password } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ message: "잘못된 요청입니다" });
  }
  try {
    const group = await Group.findById(id);
    if (!group.isPublic) {
      if (group.password !== password) {
        console.log(group.password);
        console.log(password);
        return res.status(401).send({ message: "비밀번호가 틀렸습니다" });
      } else {
        res.send({ message: "비밀번호가 확인되었습니다" });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// 그룹 공감하기
app.post('/groups/:id/like', async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: '잘못된 요청입니다' });
  }

  try {
      const group = await Group.findByIdAndUpdate(
          id,
          { $inc: { likeCount: 1 } },
          { new: true }
      );

      if (group) {
          await checkAndAwardBadges(id);
          res.send({ message: '그룹 공감하기 성공' });
      } else {
          res.status(404).send({ message: '존재하지 않습니다' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Internal Server Error' });
  }
});

// 그룹 공개 여부 확인
app.get('/groups/:id/is-public', async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: '잘못된 요청입니다' });
  }

  try {
      const group = await Group.findById(id).select('isPublic');

      if (group) {
          res.send({
              id: group._id,
              isPublic: group.isPublic
          });
      } else {
          res.status(404).send({ message: '존재하지 않습니다' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Internal Server Error' });
  }
});

