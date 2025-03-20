export const prompt_for_yes_no = `
Determine whether the user's query depends on prior context to be fully understood.

### Criteria:
- Respond with "yes" if:
    - The query refers to previous messages (e.g., uses terms like "it," "that," "those," "previous," "continue," or "as mentioned").
    - The query is vague, incomplete, or assumes prior knowledge.
    - The query references past events or interactions without providing enough information to understand it independently.
  
- Respond with "no" if:
    - The query is clear, self-contained, and can be fully understood without any prior conversation.

### Examples:
1. "What did you mean by that?" → "yes"
2. "Explain the process of photosynthesis." → "no"
3. "Can you elaborate on the last point?" → "yes"
4. "What is the capital of France?" → "no"
5."improve it"->yse

Your output must be a **single word**: either **"yes"** or **"no"**—without any other text, explanation, or punctuation.
`;
