import { Show } from "solid-js";
import { createSignal } from "solid-js";
import type { TelegramClient } from "telegram";

type AuthorizationParams = {
    client: TelegramClient,
    notifyConnectionStatus: (r: boolean) => void
}

export const Authorization = ({ client, notifyConnectionStatus }: AuthorizationParams) => {
  const [step, setStep] = createSignal<'phone' | 'code' | 'password' | 'connected' | null>(null);
  const [inputValue, setInputValue] = createSignal('');
  const [resolver, setResolver] = createSignal<((value: string) => void) | null>(null);

  const getUserInput = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      setResolver(() => resolve);
      setInputValue('');
    });
  };

  const handleSubmit = () => {
    const resolve = resolver();
    if (resolve) {
      resolve(inputValue());
      setResolver(null);
    }
  };

  const startAuth = async () => {
    try {
      await client.start({
        phoneNumber: async () => {
          setStep('phone');
          return await getUserInput("Enter phone number");
        },
        password: async () => {
          setStep('password');
          return await getUserInput("Enter password");
        },
        phoneCode: async () => {
          setStep('code');
          return await getUserInput("Enter verification code");
        },
        onError: (err) => console.log(err),
      });
      
      setStep('connected');
      console.log("Connected!");
      notifyConnectionStatus(true)
      console.log(client.session.save()); // Save this for next time
      await client.sendMessage("me", { message: "Hello from browser!" });
    } catch (error) {
        notifyConnectionStatus(false)
      console.error("Auth error:", error);
    }
  };

  return (
    <div class="text-center py-20">
      <p class="text-4xl text-green-700 mb-8">Telegram Auth</p>
      
      <Show when={step() === 'phone'}>
        <div>
          <p class="mb-4">Enter your phone number:</p>
          <input
            type="tel"
            value={inputValue()}
            onInput={(e) => setInputValue(e.currentTarget.value)}
            placeholder="+1234567890"
            class="border p-2 mr-2"
          />
          <button onClick={handleSubmit} class="bg-blue-500 text-white px-4 py-2">
            Submit
          </button>
        </div>
      </Show>

    <Show when={step() === 'code'}>
        <div>
          <p class="mb-4">Enter verification code:</p>
          <input
            type="text"
            value={inputValue()}
            onInput={(e) => setInputValue(e.currentTarget.value)}
            placeholder="12345"
            class="border p-2 mr-2"
          />
          <button onClick={handleSubmit} class="bg-blue-500 text-white px-4 py-2">
            Submit
          </button>
        </div>
    </Show>

    <Show when={step() === 'password'}>
        <div>
          <p class="mb-4">Enter 2FA password:</p>
          <input
            type="password"
            value={inputValue()}
            onInput={(e) => setInputValue(e.currentTarget.value)}
            class="border p-2 mr-2"
          />
          <button onClick={handleSubmit} class="bg-blue-500 text-white px-4 py-2">
            Submit
          </button>
        </div>
    </Show>

    <Show when={step() === 'connected'} fallback={
        <button onClick={startAuth} class="bg-green-500 text-white px-6 py-3 mt-4">
          Start Authentication
        </button>
    }>
        <p class="text-green-600">Successfully connected!</p>
    </Show>
    </div>
  );
}