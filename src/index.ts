import type { Handler } from "aws-lambda";

import * as sqs from "./sqs";
import * as espn from "./espn";

const day = 1000 * 60 * 60 * 24 * 2;

export interface Event {
  /** The polling interval in milliseconds. */
  interval: number;

  /** Epoch timestamp the polling started. */
  start: number;

  /** ID of Fantasy league to poll. */
  leagueId: string;

  /** An SWID used to authenticate with ESPN FF API. */
  swid: string;

  /** A token used to authenticate with ESPN FF API. */
  espnS2: string;

  /**
   * Date to check for game events on.
   * This option is mainly intended for testing.
   */
  to?: string;
}

export const handler: Handler<Event, void> = async (event) => {
  const to = event.to ? new Date(event.to) : new Date();
  const from = new Date(to.getTime() - day);
  const isFirstRun = Date.now() - event.start < event.interval * 1.5;
  const after = isFirstRun ? from : new Date(Date.now() - event.interval);

  const plays = await espn.getRelativePlays({
    ...event,
    from,
    to,
    after,
  });
  if (plays.length) {
    console.log(plays.map((p) => p.text));
    await sqs.sendMessage({ ...event, plays });
  }
};
