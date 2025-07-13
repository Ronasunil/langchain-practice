const express = require("express");
const model = require("./langchain");
const readline = require("readline");
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
const { PromptTemplate } = require("@langchain/core/prompts");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { Document } = require("langchain/document");
const { CohereEmbeddings, Cohere } = require("@langchain/cohere");
const { RunnableSequence } = require("@langchain/core/runnables");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");

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
      inputVariables: ["capital_placeholder"],
    });
    // const result = await model.textLLM.call("Capital of america");
    const formattedPrompt = await prompt.format({
      capital_placeholder: "india",
    });
    console.log(await model.textLLM.call(formattedPrompt));
    // console.log(response.content);

    // Rag implementation

    //  reteriving file for rag
    const filePath = path.join(__dirname, "../rag.txt");
    const file = fs.readFileSync(filePath, "utf-8");

    const document = [new Document({ pageContent: file })];

    // splitting it the file
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 100,
      chunkOverlap: 20,
    });

    const splittedDocs = await splitter.splitDocuments(document);

    // embedding and saving document
    const embeddings = new CohereEmbeddings({
      apiKey: process.env.COHERE_API_KEY,
      model: "embed-english-v3.0",
    });

    // const vectorStore = await MemoryV(
    //   splittedDocs,
    //   embeddings
    // );

    const vectorStore = await MemoryVectorStore.fromDocuments(
      splittedDocs,
      embeddings
    );

    // Retervial
    const retriever = vectorStore.asRetriever();

    const llm = new Cohere({
      apiKey: process.env.COHERE_API_KEY,
      temperature: 0,
    });

    // 4. Create a prompt template function
    function buildPrompt(context, question) {
      return `
You are a helpful assistant. Use the context below to answer the question.

Context:
${context}

Question: ${question}

Answer:`;
    }

    // 5. Build the RAG pipeline
    const ragChain = RunnableSequence.from([
      async (input) => {
        const docs = await retriever.getRelevantDocuments(input);
        const context = docs.map((doc) => doc.pageContent).join("\n\n");
        return buildPrompt(context, input);
      },
      llm,
    ]);

    // 6. Use it
    const question = "What is the main topic of this document?";
    const response = await ragChain.invoke(question);
    console.log("Answer:", response);
  } catch (error) {
    console.error("Error calling the model:", error);
  }
})();
