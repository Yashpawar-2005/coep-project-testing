import { prompt_for_yes_no } from "../utils/prompts.js";
const OLLAMA_URL = process.env.OLLAMA_URL;
const parsedata = (modelOutput) => {
  const output = modelOutput.split('</think>')[1] || modelOutput;
  const match = output.match(/\b(yes|no)\b/i);

  return match ? match[0].toLowerCase() : 'no';
};
export default async function streamresponse(req,res,next) {
    const {prompt}=req.body;
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-r1',
        prompt: prompt+prompt_for_yes_no,
        stream: false,
        // options: {
        //   temperature: 0.0,      // Makes the output deterministic (consistent)
        //   max_tokens: 5,         // Limit token length to prevent extra output
        //   stop: ['\n'],          // Stop after the first line (prevents further explanation)
        //   repeat_penalty: 1.5,   // Strongly penalize repetitive/long outputs
        // },
      },
    ),
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
    console.log(modeloutput)
    // console.log('Model Output:', modeloutput);
    const parseddata=parsedata(modeloutput)
    console.log(parseddata)
    req.body.redis_input =parseddata;
    next();
  } catch (error) {
    console.error('❌ Error streaming from DeepSeek R1:', error.message);
  }
}

