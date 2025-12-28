const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Get an intelligent hint from LLM
 * The hint should guide the user without revealing the complete solution
 */
async function getHintFromLLM(assignment, userQuery = '', errorMessage = '') {
  try {
    // Build context about the assignment
    const tableSchemas = assignment.sampleTables.map(table => {
      const columns = table.columns.map(col => `${col.columnName} (${col.dataType})`).join(', ');
      return `Table: ${table.tableName}\nColumns: ${columns}`;
    }).join('\n\n');
    
    // Build the prompt
    let prompt = `You are a helpful SQL tutor. A student is working on a SQL assignment and needs a hint (NOT the complete solution).

Assignment Details:
Title: ${assignment.title}
Difficulty: ${assignment.difficulty}
Question: ${assignment.question}

Available Tables and Schemas:
${tableSchemas}

`;

    if (errorMessage) {
      prompt += `The student's query resulted in an error:
${errorMessage}

Please provide a hint about what might be wrong and how to fix it. Do NOT provide the complete corrected query.`;
    } else if (userQuery) {
      prompt += `The student has written this query:
${userQuery}

Please provide a helpful hint to guide them toward the solution. Focus on:
- SQL concepts they should consider
- Which tables/columns might be relevant
- What SQL clauses or functions might help
- Common patterns for this type of problem

Do NOT provide the complete solution. Give them a nudge in the right direction.`;
    } else {
      prompt += `The student is just starting. Please provide a helpful hint about:
- Which tables and columns they should focus on
- What SQL concepts are relevant to this problem
- A general approach to solving this type of query

Do NOT provide the complete solution.`;
    }
    
    prompt += `\n\nRemember: Provide a HINT, not the solution. Be encouraging and educational.`;
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a patient and encouraging SQL tutor. You provide hints that guide students to discover solutions themselves, never giving away complete answers.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback hint if LLM fails
    return `Here's a hint: Review the table schemas and think about which columns you need to SELECT and how to JOIN or filter the data. Consider using WHERE clauses for filtering and ORDER BY for sorting.`;
  }
}

/**
 * Alternative implementation using Google Gemini
 * Uncomment and configure if using Gemini instead of OpenAI
 */
/*
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getHintFromLLM(assignment, userQuery = '', errorMessage = '') {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Similar prompt building as above
    const prompt = `...`; // Build your prompt here
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'Please review the table schemas and SQL concepts relevant to this problem.';
  }
}
*/

module.exports = {
  getHintFromLLM,
};

