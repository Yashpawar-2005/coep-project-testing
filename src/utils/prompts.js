export const prompt_for_yes_no = `
Evaluate whether the user's query requires prior context to be fully understood. 

- If the query is vague, incomplete, references previous information, or cannot be answered without prior conversation, respond with "yes." 
- If the query is clear, self-contained, and fully understandable on its own, respond with "no." 

Consider queries that mention words like "it," "that," "previous," or similar ambiguous terms as likely requiring context. 

Your response must be either "yes" or "no"—without any additional explanation.
`;

