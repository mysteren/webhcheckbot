import type { Context, SessionFlavor } from "grammy";

type SessionData = {
  state: string;
  newRecord: {
    url: string;
    find_value: string;
  };
};

export type MyContext = Context & SessionFlavor<SessionData>;
