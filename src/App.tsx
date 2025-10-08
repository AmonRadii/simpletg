import type { Component } from 'solid-js';
import { createEffect, createSignal, Show } from 'solid-js';
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { Authorization } from './Authorization';

const apiId = import.meta.env.VITE_TELEGRAM_API_ID;
const apiHash = import.meta.env.VITE_TELEGRAM_API_HASH;
const username = import.meta.env.VITE_USERNAME;

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

  createEffect(() => {
    if (connectionStatus() === true) {
        client.getInputEntity(username).then(result => {
        client.getMessages(result).then(r => console.log(r))
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