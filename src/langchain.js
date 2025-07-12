const { ChatCohere } = require("@langchain/cohere");
const dotenv = require("dotenv");

dotenv.config();

console.log(process.env.OPEN_AI_KEY);

const model = new ChatCohere({
  apiKey: process.env.COHERE_API_KEY,
});

// model = { model };

module.exports = { model };
