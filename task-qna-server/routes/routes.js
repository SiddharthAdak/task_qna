import express from "express"
import { findAns } from "../controller/qna_controller.js";
const router = express.Router();

router.post('/ques',findAns);
export default router