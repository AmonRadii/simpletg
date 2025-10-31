import type { Component } from 'solid-js';
import { createEffect, createSignal, For, Show } from 'solid-js';
import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { Authorization } from './Authorization';
import { store } from './livestore/store';
import { events, MessageText, tables } from './livestore/schema';
import { queryDb } from '@livestore/livestore';

const apiId = Number(import.meta.env.VITE_TELEGRAM_API_ID)
const apiHash = String(import.meta.env.VITE_TELEGRAM_API_HASH)
const username = String(import.meta.env.VITE_USERNAME);

interface Message {
  id: number;
  peerId: string;
  date: number;
  text: MessageText;
  editDate: number | null;
}



const App: Component = () => {
  const [connectionStatus, setConnectionStatus] = createSignal<boolean | null>(null);

  const storedSession = window.localStorage.getItem("stringSessionTg")

  const stringSession = new StringSession(storedSession ?? "");

  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  // we don't know if we are authorized yet
  
  if (stringSession !== undefined) {
    client.connect().then(r => {
      setConnectionStatus(true)
    })
  }

  // important fields: 
  // id: number
  // - peerId 
  // - date: number;
  // message: string;
  // entities?: Api.TypeMessageEntity[];
  // 

  createEffect(() => {
    if (connectionStatus() === true) {
      client.getMe().then(result => console.log(result))

      client.getInputEntity(username)
        .then(result => {
          console.log(result)
          if (result.className !== "InputPeerUser") return;

          client.getMessages(result).then(messages => {
            // make events
            messages.forEach(message => {
              // was the message already stored
              // if not, store it
              const id = result.userId + "/" + message.id

              const existingMessage = store()?.query(tables.messages.select().where("id", "=", id ).first({fallback: () => undefined}))  

              if (existingMessage !== undefined) return;

              store()?.commit(events.messageCreated({
                messageId: message.id,
                peerId: result.userId.toString(),
                createdAt: message.date,
                messageText: [{
                  text: message.message ?? "",
                  bold: false,
                  italic: false,
                  underline: false
                }]
              }))

              // what do we do if message was already edited at this point
            })
          })
        })
    }
  })

  const [messages, setMessages] = createSignal<Message[]>([]);

  store()?.subscribe(queryDb(tables.messages.select()), {
    onUpdate: (newMessages) => {
      const mappedMessages: Message[] = [];
      newMessages.forEach((msg, i) => {
        const lastElementIndex = mappedMessages.length - 1;
        const newIndex = lastElementIndex - i;

        mappedMessages[newIndex] ={
        id: msg.messageId,
        peerId: msg.peerId,
        date: msg.createdAt,
        text: [...msg.messageText],
        editDate: msg.editedAt
      }
      })
      setMessages(mappedMessages);
    }
  })

  

  return (<div>
    <Show when={storedSession == undefined}>
      <Authorization client={client} notifyConnectionStatus={setConnectionStatus}></Authorization>
    </Show>
    <For each={messages()}>
      {(message) => (
        <div style="border: 1px solid black; margin: 10px; padding: 10px;">
          <div>{message.text.map((textElement) => textElement.text).join(" ")}</div>
          </div>
      )}
    </For>

  </div>)
};

export default App;