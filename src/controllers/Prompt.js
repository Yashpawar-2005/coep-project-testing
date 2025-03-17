import { redis } from "../db/Connect.js";
import { prisma } from '../db/Connect.js';
const OLLAMA_URL = process.env.OLLAMA_URL;

const prompt_to_redis_handler = async (req, res) => {
  const user_prompt = req.body.prompt;
  const { redis_input } = req.body;
  console.log(user_prompt+"      "+redis_input)

  try {
    const check = (await redis.lLen("userstack")) === 0;

    if (redis_input.toLowerCase().trim() =="yes" && check>0) {
        console.log('omgggg')
      if (check) {
        return res.json({ message: "nothing in stack" });
      }

      const tollm = await redis.rPop("userstack");
      const parsedtollm = JSON.parse(tollm);
      console.log(parsedtollm);
      const prevcomment=parsedtollm.query;
      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-r1",
          prompt: `This was your previous response to the previous query: ${JSON.stringify(parsedtollm)}. Current prompt: ${user_prompt}`,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullResponse = "";

      res.setHeader("Content-Type", "text/plain");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        chunk.split("\n").forEach((line) => {
            if (line.trim()) {
              try {
                const parsedLine = JSON.parse(line);
                if (parsedLine.response) {
                  res.write(parsedLine.response);
                  fullResponse += parsedLine.response;
                }
              } catch (err) {
                console.error("Failed to parse chunk:", line);
              }
            }
            });
      }

      res.end();

      await redis.rPush("userstack", JSON.stringify({ query: prevcomment, res: fullResponse }));
      console.log("✅ Updated Stack Entry:", { query: prevcomment, res: fullResponse });

    } 
    
    
    
    else {
        console.log("dfadfasdfassdfa")
      await redis.rPush("userstack", JSON.stringify({ query: user_prompt, res: null }));
      console.log(`Pushed prompt to stack: ${user_prompt}`);

      // Call Python backend here

      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-r1",
          prompt: `Solve this ${user_prompt}`,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullResponse = "";

      res.setHeader("Content-Type", "text/plain");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        chunk.split("\n").forEach((line) => {
            if (line.trim()) {
              try {
                const parsedLine = JSON.parse(line);
                if (parsedLine.response) {
                  res.write(parsedLine.response);
                  fullResponse += parsedLine.response;
                }
              } catch (err) {
                console.error("Failed to parse chunk:", line);
              }
            }
        });
      }

      res.end();

      const lastPrompt = await redis.rPop("userstack");
      const updatedEntry = { ...JSON.parse(lastPrompt), res: fullResponse };
      await redis.rPush("userstack", JSON.stringify(updatedEntry));

      console.log("✅ Updated Stack Entry:", updatedEntry);
    }



  } catch (error) {
    console.error("❌ Error in prompt_to_redis_handler:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};


const submit_to_admin = async (req, res) => {
  try {
      const progress = req.body.progress;
      const userId = req.userId;
      const teamid = req.params.teamid;

      if (!progress || !userId || !teamid) {
          return res.status(400).json({ error: "Missing required fields" });
      }

      const prog = JSON.stringify(progress);

      const data = await prisma.tempcodes.create({
          data: {
              userId: userId,
              content: prog,
              pendingteamcodeid:Number(teamid) 
          },
      });

      res.status(201).json({ message: "Sent the request to the admin", data: data });
  } catch (error) {
      console.error("Error submitting to admin:", error);
      res.status(500).json({ error: "Internal server error" });
  }
};
export { prompt_to_redis_handler,submit_to_admin };
