import { uuid } from "uuidv4";

export default class ChatGPTClient {
  accessToken: string | null = null;
  conversationId: string | null = null;
  lastMessageId: string = uuid();

  public async loginFromNextAuthSessionToken(nextAuthSessionToken: string) {
    const response = await fetch("https://chat.openai.com/api/auth/session", {
      headers: {
        accept: "*/*",
        "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        "if-none-match": '"11xxpujbgv2148"',
        "sec-ch-ua": '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        cookie: `__Secure-next-auth.session-token=${nextAuthSessionToken}`,
        Referer: "https://chat.openai.com/chat",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: null,
      method: "GET",
    });

    const { accessToken, ...rest } = await response.json();
    this.accessToken = accessToken;
  }

  private async throwIfNotLogged() {
    if (this.accessToken === null) {
      throw new Error('client is not logged, you must call ChatGPTClient.loginFromNextAuthSessionToken("YOUR_TOKEN") before.');
    }
  }

  public async getModels() {
    this.throwIfNotLogged();

    const response = await fetch("https://chat.openai.com/backend-api/models", {
      headers: {
        accept: "*/*",
        "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        authorization: `Bearer ${this.accessToken}`,
        "content-type": "application/json",
        "sec-ch-ua": '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        Referer: "https://chat.openai.com/chat",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: null,
      method: "GET",
    });

    return await response.json();
  }

  public async startNewConversation() {
    this.conversationId = null;
    this.lastMessageId = uuid();
  }

  public async write(text: string) {
    this.throwIfNotLogged();

    const body = JSON.stringify({
      action: "next",
      messages: [
        {
          id: uuid(),
          role: "user",
          content: {
            content_type: "text",
            parts: [text],
          },
        },
      ],
      parent_message_id: this.lastMessageId,
      model: "text-davinci-002-render",
      ...(this.conversationId ? { conversation_id: this.conversationId } : {}),
    });

    const response = await fetch("https://chat.openai.com/backend-api/conversation", {
      headers: {
        accept: "text/event-stream",
        "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        authorization: `Bearer ${this.accessToken}`,
        "content-type": "application/json",
        "sec-ch-ua": '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-openai-assistant-app-id": "",
      },
      referrer: "https://chat.openai.com/chat",
      referrerPolicy: "strict-origin-when-cross-origin",
      body,
      method: "POST",
      mode: "cors",
      credentials: "include",
    });

    const fullResponseStream = await response.text();
    const json = [...fullResponseStream.matchAll(/^data: ({.+})$/gm)].map((match) => match[1]).at(-1) as string;
    const lastEvent = JSON.parse(json);

    this.conversationId = lastEvent.conversation_id;
    this.lastMessageId = lastEvent.message.id;

    return lastEvent.message.content.parts;
  }
}
