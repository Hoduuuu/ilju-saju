import type { InterpretErrorCode, InterpretEvent } from "./claudeEvents";

export interface InterpretState {
  status: "idle" | "streaming" | "done" | "error";
  text: string;
  error: { code: InterpretErrorCode; message: string } | null;
}

export type InterpretAction =
  | { type: "start" }
  | { type: "event"; event: InterpretEvent }
  | { type: "networkError"; message: string; code?: InterpretErrorCode };

export const INITIAL_INTERPRET_STATE: InterpretState = { status: "idle", text: "", error: null };

export function interpretReducer(state: InterpretState, action: InterpretAction): InterpretState {
  switch (action.type) {
    case "start":
      return { status: "streaming", text: "", error: null };
    case "networkError":
      return { ...state, status: "error", error: { code: action.code ?? "failed", message: action.message } };
    case "event": {
      const { event } = action;
      if (event.type === "text") return { ...state, status: "streaming", text: state.text + event.text };
      if (event.type === "done") return { ...state, status: "done" };
      return { ...state, status: "error", error: { code: event.code, message: event.message } };
    }
  }
}
