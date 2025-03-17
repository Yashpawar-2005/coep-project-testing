import { prompt_for_yes_no } from "../utils/prompts.js";
const OLLAMA_URL = process.env.OLLAMA_URL;

export default async function streamResponse(req,res,next) {
    const {prompt}=req.body;
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'olmo2',
        prompt: prompt+prompt_for_yes_no,
        stream: false,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    // const reader = response.body.getReader();
    // const decoder = new TextDecoder('utf-8');
    // let response_to_prompt="";
    // while (true) {
    //   const { done, value } = await reader.read();
    //   if (done) break;
    //   const chunk = decoder.decode(value);
    //   response_to_prompt+=chunk
    //   // process.stdout.write(chunk);
    // }
    // return response_to_prompt
    const data = await response.json();
    const modeloutput = data.response;
    console.log('Model Output:', modeloutput);
    req.body.redis_input = modeloutput;
    next();
  } catch (error) {
    console.error('❌ Error streaming from DeepSeek R1:', error.message);
  }
}



// streamResponse('Write a haiku about the beauty of nature.');
