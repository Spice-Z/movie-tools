const fs = require("fs");
const axios = require("axios");
const readline = require("readline");
const FormData = require("form-data");
const path = require("path");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DIST_DIR = path.join(__dirname, "dist");
const INPUT_DIR = path.join(__dirname, "input");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


async function transcribeAudioFile(apiKey, audioFilePath, model) {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(audioFilePath));
  formData.append("model", model);
  formData.append("response_format", "srt");
  formData.append("language", "ja");
  formData.append("prompt", "filler wordsを含めて文字起こししてください");

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${apiKey}`,
        },
        maxContentLength: 100000000,
        maxBodyLength: 1000000000,
      }
    );
  
    return response.data;
  } catch (error) {
    console.log('errorです')
    console.log({error})
    console.log(error.response.data)
    throw new Error('errorだ');
  }

  
}

async function saveStringAsTextFile(content, filePath) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, content, "utf8", (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}


async function main() {
  const targetFilePath = path.join(INPUT_DIR, "audio.mp3");
  
  console.log(targetFilePath)

  console.log('start to whisper')
  console.log(OPENAI_API_KEY)
  const whisperResult = await transcribeAudioFile(
    OPENAI_API_KEY,
    targetFilePath,
    "whisper-1"
  );

  const text = whisperResult;
  const outputPath = path.join(DIST_DIR, "output.srt");

  await saveStringAsTextFile(text, outputPath);

  rl.close();
}

main().catch((error) => {
  console.error("Error:", error);
  rl.close();
});
