import express from "express"
import { findAns, processDoc, findUserData, deleteUserData } from "../controller/qna_controller.js";
const router = express.Router();
import multer from "multer";
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });
router.post('/ques',findAns);
router.post('/processdoc', upload.single('file'), processDoc);
router.get('/getdata', findUserData);
router.delete('/:id', deleteUserData);
export default router