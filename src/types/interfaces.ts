export interface IAppState {
  game: IGameState;

  settings: ISettingsState;

  rating: {
    field: number;
    withOnline: boolean;
    withBot: boolean;
    top: IRatingItem[];
  };
}

export interface ISettingsState {
  lang: string;
  isSoundOn: boolean;
  gamerName: string;
  secondGamerName: string;
  currentTheme: string | null;
}

export interface IGameState {
  isOnline: boolean;
  fieldSize: number;
  time: number;
  isBot: boolean;
  firstWord: string;
  currentWord: string;
  isPlayer1Turn: boolean;
  player1: IPlayerState;
  player2: IPlayerState;
}

export interface IPlayerState {
  points: number;
  words: string[];
}

export interface IRatingItem {
  position: number;
  name: string;
  points: number;
  word: string;
  date: Date;
}
