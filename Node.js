import express from "express";
import multer from "multer";
import fs from "fs";
import OpenAI from "openai";

const app = express();
const upload = multer({ dest: "uploads/" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/transcribe", upload.single("file"), async (req, res) => {
  try {
    const fileStream = fs.createReadStream(req.file.path);

    const transcription = await openai.audio.transcriptions.create({
      file: fileStream,
      model: "whisper-1"
    });

    fs.unlinkSync(req.file.path); // حذف الملف بعد المعالجة
    res.json({ text: transcription.text });
  } catch (err) {
    console.error(err);
    res.json({ text: null });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
