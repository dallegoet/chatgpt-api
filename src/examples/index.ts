import dotenv from "dotenv";
import ChatGPTClient from "../chatGPTClient";

dotenv.config();

const client = new ChatGPTClient();
client.loginFromNextAuthSessionToken(process.env.NEXT_AUTH_SESSION_TOKEN as string).then(async () => {
  let messages = await client.write("combien font 18 + 7 ?");
  console.log(messages);

  messages = await client.write("et si tu ajoutes 12 ?");
  console.log(messages);

  messages = await client.write("peux tu me coder un composant reactjs qui ajoute deux nombres ?");
  console.log(messages);
});
