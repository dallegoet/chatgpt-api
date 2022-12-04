# installation

```shell
npm install @dallegoet/chatGPT-api
```

# usage

```typescript
import ChatGPTClient from "../chatGPTClient";

// you can find this token on https://chat.openai.com/chat
// Open your dev tools, network tab, and check the cookie named : __Secure-next-auth.session-token
const NEXT_AUTH_SESSION_TOKEN = "YOUR_TOKEN";

await client.loginFromNextAuthSessionToken(NEXT_AUTH_SESSION_TOKEN);
console.log(await client.write("combien font 20 + 20 ?"));
console.log(await client.write("et si tu ajoutes 2 ?"));
console.log(await client.write("est ce la réponse de l'univers ?"));
```

Output :

```json
[ '20 + 20 = 40.' ]
[ 'Si on ajoute 2 à 20 + 20, on obtient 20 + 20 + 2 = 42.' ]
[
  `Non, 42 n'est pas la réponse ultime de la vie, c'est simplement le résultat d'une opération mathématique. La réponse ultime de la vie, si elle existe, est un concept qui dépasse le domaine des mathématiques et de la logique. C'est un sujet de discussion métaphysique et philosophique, qui a été abordé dans de nombreuses œuvres de fiction, comme le livre "Le Guide du voyageur galactique" de Douglas Adams. Dans ce livre, la réponse ultime de la vie est révélée être 42, mais cela n'a aucun sens dans la réalité.`
]
```