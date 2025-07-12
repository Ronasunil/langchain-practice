const express = require("express");
const model = require("./langchain");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");

const app = express();

app.listen(2000);

const messages = [
  new SystemMessage("Translate the following from English into Italian"),
  new HumanMessage("hi!"),
];

(async () => {
  try {
    const response = await model.model.invoke(messages);
    console.log(response);
    // console.log(response.content);
  } catch (error) {
    console.error("Error calling the model:", error);
  }
})();
