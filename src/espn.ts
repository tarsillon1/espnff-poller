import * as espnff from "espnff/src";

export interface GetRelativeEventsRequest extends espnff.Auth {
  from: Date;
  to: Date;
  after: Date;
  leagueId: string;
}

const getSeasonFromDate = (data: Date) => {
  let season = data.getFullYear();
  if (data.getMonth() < 3) {
    season--;
  }
  return season.toString();
};

export const getRelativePlays = async ({
  from,
  to,
  after,
  leagueId,
  swid,
  espnS2,
}: GetRelativeEventsRequest): Promise<espnff.Play[]> => {
  const [{ teams }, { events }] = await Promise.all([
    espnff.getLeague({
      season: getSeasonFromDate(from),
      leagueId,
      swid,
      espnS2,
    }),
    espnff.getEvents({ from, to, swid, espnS2 }),
  ]);

  const teamPlayers: Map<string, string> = new Map();
  teams.forEach(({ roster: { entries }, nickname }) =>
    entries.forEach(({ playerId, lineupSlotId }) => {
      if (espnff.RosterSlot.Bench === lineupSlotId) return;
      teamPlayers.set(playerId.toString(), nickname);
    })
  );

  const relativePlays: Map<number, espnff.Play> = new Map();
  const addPlayIfRelative = (play: espnff.Play) => {
    const wall = new Date(play.walltime);
    if (
      wall < after ||
      !play.players.some(({ playerId }) => teamPlayers.has(playerId))
    ) {
      return;
    }
    relativePlays.set(play.playId, play);
  };
  events.forEach((event) => {
    event.drive.plays.forEach(addPlayIfRelative);
    event.scoringPlays.forEach(addPlayIfRelative);
  });

  return [...relativePlays.values()];
};
