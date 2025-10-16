import type { Component } from 'solid-js';
import { createEffect, createSignal, Show } from 'solid-js';
import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { Authorization } from './Authorization';

const apiId = Number(import.meta.env.VITE_TELEGRAM_API_ID)
const apiHash = String(import.meta.env.VITE_TELEGRAM_API_HASH)
const username = String(import.meta.env.VITE_USERNAME);

interface Message {
  id: number;
  peerId: Api.TypePeer;
  date: number;
  text: MessageText;
  editDate?: number;
}
// Dialog only for now, but channels and groups will be included later 
interface Peer {
  name: string;
  lastName: string;
  username: string;
  peerId: Api.TypePeer;
  unreadCount: number;
  totalCount: number;
  topMessageId: number;
  lastSeenMessageId?: number;
}

interface TextElement {
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  url?: string;
}

type MessageText = TextElement[];


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

        client.getInputEntity(username).then(result => {
          console.log(result)

        client.getMessages(result).then(message => console.log(message))
      })
    }
  })

  return (<div>
    <Show when={storedSession == undefined}>
      <Authorization client={client} notifyConnectionStatus={setConnectionStatus}></Authorization>
    </Show>
    shosy
  </div>)
};

export default App;