const express = require("express");
const model = require("./langchain");
const readline = require("readline");
const { promisify } = require("util");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
const { PromptTemplate } = require("@langchain/core/prompts");

const app = express();

app.listen(2000);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = promisify(rl.question).bind(rl);

(async () => {
  try {
    //     const userInput = await ask("Enter what u want to translate?");

    //     const messages = [
    //       {
    //         role: "system",
    //         content: `You are a translation assistant. Your only job is to translate any input text from English to French.
    // Never respond in any other way. Never introduce yourself or provide additional context. Only reply with the translation in French.`,
    //       },
    //       { role: "human", content: userInput },
    //     ];
    //     console.log("generating...");
    //     const response = await model.model.invoke(messages);
    //     console.log(response.content);
    const prompt = new PromptTemplate({
      template:
        "You are a helful assisant which only return the capital of a country in a word this mean only capital should be the outcome no other sentences. So what is the caiptal of {capital_placeholder}?",
      inputVariables:["capital_placeholder"]
    });
    // const result = await model.textLLM.call("Capital of america");
    const formattedPrompt = await prompt.format({capital_placeholder:"india"})
    console.log(await model.textLLM.call(formattedPrompt));
    // console.log(response.content);
  } catch (error) {
    console.error("Error calling the model:", error);
  }
})();
