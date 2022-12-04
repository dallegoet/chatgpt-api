import dotenv from "dotenv";
import ChatGPTClient from "..";

dotenv.config();

const client = new ChatGPTClient();
client.loginFromNextAuthSessionToken(process.env.NEXT_AUTH_SESSION_TOKEN as string).then(async () => {
  console.log(await client.write("combien font 20 + 20 ?"));
  console.log(await client.write("et si tu ajoutes 2 ?"));
  console.log(await client.write("est ce que le résultat de cette dernière opération ne serait pas la réponse ultime de la vie, en imaginant un peu ?"));
});
