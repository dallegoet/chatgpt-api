import { v4 } from "uuid";
import fetch from "node-fetch";

export default class ChatGPTClient {
  readonly defaultModel = "text-davinci-002-render";
  readonly baseUri = "https://chat.openai.com";
  readonly baseHeaders = {
    accept: "*/*",
    "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
    "if-none-match": '"11xxpujbgv2148"',
    "content-type": "application/json",
    "sec-ch-ua": '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    Referer: "https://chat.openai.com/chat",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };

  accessToken: string | null = null;
  conversationId: string | null = null;
  lastMessageId: string = v4();

  public async loginFromNextAuthSessionToken(nextAuthSessionToken: string) {
    const response = await fetch(`${this.baseUri}/api/auth/session`, {
      method: "GET",
      headers: {
        ...this.baseHeaders,
        cookie: `__Secure-next-auth.session-token=${nextAuthSessionToken}`,
      },
    });

    const { accessToken } = (await response.json()) as { accessToken: string };
    this.accessToken = accessToken;
  }

  public async getModels() {
    this.throwIfNotLogged();

    const response = await fetch(`${this.baseUri}/backend-api/models`, {
      method: "GET",
      headers: {
        ...this.baseHeaders,
        authorization: `Bearer ${this.accessToken}`,
      },
    });

    return await response.json();
  }

  public async startNewConversation() {
    this.conversationId = null;
    this.lastMessageId = v4();
  }

  public async write(text: string, model = this.defaultModel) {
    this.throwIfNotLogged();

    const body = JSON.stringify({
      action: "next",
      messages: [
        {
          id: v4(),
          role: "user",
          content: {
            content_type: "text",
            parts: [text],
          },
        },
      ],
      parent_message_id: this.lastMessageId,
      model,
      ...(this.conversationId ? { conversation_id: this.conversationId } : {}),
    });

    const response = await fetch(`${this.baseUri}/backend-api/conversation`, {
      body,
      method: "POST",
      headers: {
        ...this.baseHeaders,
        authorization: `Bearer ${this.accessToken}`,
      },
    });

    const fullResponseStream = await response.text();
    const json = [...fullResponseStream.matchAll(/^data: ({.+})$/gm)].map((match) => match[1]).at(-1) as string;
    const lastEvent = JSON.parse(json);

    this.conversationId = lastEvent.conversation_id;
    this.lastMessageId = lastEvent.message.id;

    return lastEvent.message.content.parts;
  }

  private async throwIfNotLogged() {
    if (this.accessToken === null) {
      throw new Error('client is not logged, you must call client.loginFromNextAuthSessionToken("YOUR_TOKEN") before.');
    }
  }
}
