# Chatbot Auth Integration Plan

This template needs the App Studio auth changes (Pi SDK + iframe fallback + backend fallback). Below is an implementation guide with inline code to copy.

## 1) Add missing config shims

Create `lib/app-config.ts` to hold template meta:

\`\`\`ts
export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || "My Chatbot",
  DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Talk with my bot",
  WELCOME_MESSAGE: process.env.NEXT_PUBLIC_WELCOME_MESSAGE || "Hi! Ask me anything.",
};

export const COLORS = {
  PRIMARY: process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#7c3aed",
  BACKGROUND: process.env.NEXT_PUBLIC_BACKGROUND_COLOR || "#f9fafb",
};
\`\`\`

Create `lib/system-config.ts` for endpoints and Pi SDK config:

\`\`\`ts
const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export const BACKEND_URLS = {
  LOGIN: `${BACKEND_BASE}/v1/login`,
  APPSTUDIO_LOGIN: `${BACKEND_BASE}/v1/appstudio/login`,
  CHAT: `${BACKEND_BASE}/v1/chat/default`,
};

export const PI_NETWORK_CONFIG = {
  SDK_URL: process.env.NEXT_PUBLIC_PI_SDK_URL || "",
  SANDBOX: process.env.NEXT_PUBLIC_PI_SANDBOX === "true",
  IFRAME_TIMEOUT_MS: Number(process.env.NEXT_PUBLIC_IFRAME_TIMEOUT_MS || 60000),
};
\`\`\`

## 2) Update `hooks/use-pi-network-authentication.ts`

Replace file contents with the flow that chooses Pi SDK when available, otherwise iframe, and falls back to `/v1/appstudio/login` when primary login fails. This also stores `appId` and exposes retry.

\`\`\`ts
// LOCKED FILE (v0 shouldn't edit this file)
import { useEffect, useState } from "react";
import { PI_NETWORK_CONFIG, BACKEND_URLS } from "@/lib/system-config";

interface PiAuthResult {
  accessToken: string;
  user: { uid: string; username: string; roles?: string[] };
}

const COMM_REQUEST_TYPE = "@pi:app:sdk:communication_information_request";

const loadPiSDK = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if (!PI_NETWORK_CONFIG.SDK_URL) return reject(new Error("SDK URL is not set"));
    const script = document.createElement("script");
    script.src = PI_NETWORK_CONFIG.SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Pi SDK script"));
    document.head.appendChild(script);
  });

const hasPiSdk = () => typeof window !== "undefined" && typeof window.Pi?.init === "function";

export const usePiNetworkAuthentication = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMessage, setAuthMessage] = useState("Loading Pi Network SDK...");
  const [piAccessToken, setPiAccessToken] = useState<string | null>(null);
  const [appId, setAppId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const performLogin = async (path: string, payload: Record<string, string | null>) => {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => null);
    return { res, body };
  };

  const shouldFallback = (status: number, errorType?: string | null, fallbackAppId?: string | null) => {
    if (!fallbackAppId) return false;
    if (errorType === "pi_app_not_registered") return true;
    if (status === 404) return true;
    return status >= 500;
  };

  const loginWithBackend = async (token: string, candidateAppId: string | null) => {
    const primary = await performLogin(BACKEND_URLS.LOGIN, { pi_auth_token: token });
    if (primary.res.ok) return;
    const errType = typeof primary.body?.error_type === "string" ? primary.body.error_type : null;
    if (!shouldFallback(primary.res.status, errType, candidateAppId)) {
      throw new Error(`Backend login failed (${primary.res.status})`);
    }
    const fallback = await performLogin(BACKEND_URLS.APPSTUDIO_LOGIN, {
      pi_auth_token: token,
      app_id: candidateAppId,
    });
    if (!fallback.res.ok) {
      throw new Error(`Fallback login failed (${fallback.res.status})`);
    }
  };

  const requestParentCredentials = (requestId: string) =>
    new Promise<{ accessToken: string; appId: string | null }>((resolve, reject) => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      const cleanup = (listener: (e: MessageEvent) => void) => {
        window.removeEventListener("message", listener);
        if (timeoutId) clearTimeout(timeoutId);
      };

      const listener = (event: MessageEvent) => {
        // TODO: tighten origin check when parent origin is known
        const payload = typeof event.data === "string" ? safeJson(event.data) : event.data;
        if (!payload || payload.type !== COMM_REQUEST_TYPE || payload.id !== requestId) return;
        cleanup(listener);
        const data = typeof payload.payload === "object" && payload.payload ? payload.payload : {};
        const accessToken = typeof data.accessToken === "string" ? data.accessToken : null;
        const appId = typeof data.appId === "string" ? data.appId : null;
        if (!accessToken) return reject(new Error("No access token provided."));
        resolve({ accessToken, appId });
      };

      timeoutId = setTimeout(() => {
        cleanup(listener);
        reject(new Error("Authentication timed out. Please refresh the preview."));
      }, PI_NETWORK_CONFIG.IFRAME_TIMEOUT_MS || 60000);

      window.addEventListener("message", listener);
      window.parent.postMessage(
        JSON.stringify({ type: COMM_REQUEST_TYPE, id: requestId }),
        "*"
      );
    });

  const authenticateViaPiSdk = async () => {
    setAuthMessage("Initializing Pi Network...");
    await window.Pi.init({ version: "2.0", sandbox: PI_NETWORK_CONFIG.SANDBOX });
    setAuthMessage("Authenticating with Pi Network...");
    const scopes = ["username", "roles", "payments"];
    const piAuthResult: PiAuthResult = await window.Pi.authenticate(scopes);
    if (!piAuthResult.accessToken) throw new Error("Missing Pi access token");
    setAuthMessage("Logging in to backend...");
    await loginWithBackend(piAuthResult.accessToken, null);
    setPiAccessToken(piAuthResult.accessToken);
  };

  const authenticateViaIframe = async () => {
    setAuthMessage("Requesting authentication...");
    const reqId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const { accessToken, appId: receivedAppId } = await requestParentCredentials(reqId);
    setAuthMessage("Logging in to backend...");
    await loginWithBackend(accessToken, receivedAppId || null);
    setPiAccessToken(accessToken);
    setAppId(receivedAppId || null);
  };

  const initialize = async () => {
    setError(null);
    setIsAuthenticated(false);
    setAuthMessage("Loading Pi Network SDK...");
    try {
      if (!hasPiSdk()) await loadPiSDK();
      if (hasPiSdk()) {
        await authenticateViaPiSdk();
      } else if (typeof window !== "undefined" && window.parent !== window) {
        await authenticateViaIframe();
      } else {
        throw new Error("Pi Network SDK is not available in this context.");
      }
      setIsAuthenticated(true);
      setAuthMessage("Authenticated");
    } catch (err: any) {
      console.error("Auth failed", err);
      setError(err?.message || "Failed to authenticate or login. Please refresh and try again.");
      setAuthMessage(err?.message || "Failed to authenticate or login. Please refresh and try again.");
    }
  };

  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isAuthenticated, authMessage, piAccessToken, appId, error, reinitialize: initialize };
};

function safeJson(value: any) {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
\`\`\`

## 3) Update `hooks/use-chatbot.ts`

Wire chat calls to the token and handle freemium limit error type.

\`\`\`ts
import { useEffect, useRef, useState } from "react";
import type { Message } from "@/lib/types";
import { usePiNetworkAuthentication } from "./use-pi-network-authentication";
import { APP_CONFIG } from "@/lib/app-config";
import { BACKEND_URLS } from "@/lib/system-config";

const createMessage = (text: Message["text"], sender: Message["sender"], id?: Message["id"]): Message => ({
  id: id || Date.now().toString(),
  text,
  sender,
  timestamp: new Date(),
});

export const useChatbot = () => {
  const { isAuthenticated, authMessage, piAccessToken, error } = usePiNetworkAuthentication();
  const [messages, setMessages] = useState<Message[]>([createMessage(APP_CONFIG.WELCOME_MESSAGE, "ai", "1")]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const thinkingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showThinking = () => {
    const thinkingMessage = createMessage("Thinking... (0)", "ai", "thinking");
    setMessages((prev) => [...prev, thinkingMessage]);
    let seconds = 0;
    thinkingTimerRef.current = setInterval(() => {
      seconds += 1;
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg.id === "thinking" ? { ...msg, text: `Thinking... (${seconds})` } : msg))
      );
    }, 1000);
  };

  const hideThinking = () => {
    if (thinkingTimerRef.current) {
      clearInterval(thinkingTimerRef.current);
      thinkingTimerRef.current = null;
    }
    setMessages((prev) => prev.filter((msg) => msg.id !== "thinking"));
  };

  const sendMessage = async () => {
    if (!piAccessToken || !input.trim() || !isAuthenticated || error) return;
    const userMessage = createMessage(input.trim(), "user");
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    showThinking();

    try {
      const response = await fetch(BACKEND_URLS.CHAT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: piAccessToken },
        body: JSON.stringify({ message: userMessage.text }),
      });

      hideThinking();

      if (response.status === 429) {
        const errorData = await response.json();
        const errorMessage = createMessage(
          errorData.error_type === "freemium_limit_exceeded" ? errorData.error : "Too many requests. Please try again later.",
          "ai"
        );
        setMessages((prev) => [...prev, errorMessage]);
        return;
      }

      const data = await response.json();
      if (data.messages && Array.isArray(data.messages)) {
        const aiMsg = data.messages.reverse().find((m: any) => m.sender === "ai");
        const botMessage = createMessage(aiMsg ? aiMsg.text : "No AI response received.", "ai");
        setMessages((prev) => [...prev, botMessage]);
      } else {
        setMessages((prev) => [...prev, createMessage("No response from backend.", "ai")]);
      }
    } catch (err) {
      hideThinking();
      setMessages((prev) => [...prev, createMessage("Error contacting backend.", "ai")]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);

  useEffect(() => () => thinkingTimerRef.current && clearInterval(thinkingTimerRef.current), []);

  return { messages, input, isLoading, isAuthenticated, authMessage, error, sendMessage, handleKeyPress, handleInputChange };
};
\`\`\`

## 4) UI overlay hook-up (`app/page.tsx`)

Show the blocking overlay when not authenticated or when auth errored. Add a retry button that calls `reinitialize` from the hook.

\`\`\`tsx
// In the component
const { messages, input, isLoading, isAuthenticated, authMessage, error, sendMessage, handleKeyPress, handleInputChange } = useChatbot();

if (!isAuthenticated) {
  return (
    <div className="fixed inset-0 bg-white/95 z-50 flex flex-col items-center justify-center">
      <div className="text-xl font-semibold mb-4">{APP_CONFIG.NAME}</div>
      <div className="text-lg mb-4 text-center px-6">{authMessage}</div>
      {!error && <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderBottomColor: COLORS.PRIMARY }} />}
      {error && <button className="mt-4 px-4 py-2 rounded text-white" style={{ backgroundColor: COLORS.PRIMARY }} onClick={() => window.location.reload()}>Retry</button>}
    </div>
  );
}
\`\`\`

## 5) Env vars to set

- `NEXT_PUBLIC_BACKEND_URL` (e.g., `https://api.example.com`)
- `NEXT_PUBLIC_PI_SDK_URL` (Pi SDK script URL)
- `NEXT_PUBLIC_PI_SANDBOX` (`true`/`false`)
- `NEXT_PUBLIC_IFRAME_TIMEOUT_MS` (optional, default 60000)
- Branding: `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_DESCRIPTION`, `NEXT_PUBLIC_WELCOME_MESSAGE`, `NEXT_PUBLIC_PRIMARY_COLOR`, `NEXT_PUBLIC_BACKGROUND_COLOR`.

## 6) QA checklist

- Pi browser context (SDK present): login hits `/v1/login`, succeeds.
- Iframe preview (no SDK): parent supplies accessToken/appId, primary `/v1/login` 404 or `pi_app_not_registered`, fallback `/v1/appstudio/login` succeeds.
- Missing `appId` in iframe + primary failure → clear error shown.
- Chat 429 with `freemium_limit_exceeded` shows the proper message.
\`\`\`
