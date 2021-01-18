export interface IAppState {
  notify: INotify | null;
  modal: IModal | null;
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
  isMusicOn: boolean;
  gamerNames: Array<string>;
  currentTheme: string | null;
}

export interface ISettingsPage {
  lang?: string;
  isSoundOn?: boolean;
  gamerNames: Array<string>;
  currentTheme: string | null;
}

export interface IGameState {
  isOnline: boolean;
  fieldSize: number;
  time: number;
  isBot: boolean;
  firstWord: string;
  currentWord: string;
  playerTurnId: number;
  isGameStart: boolean;
  isWin: number;
  duration: number;
  player1: IPlayerState;
  player2: IPlayerState;
}

export interface IPlayerState {
  points: number;
  words: string[];
  penalties: number;
}

export interface IRatingItem {
  position: number;
  name: string;
  points: number;
  word: string;
  date: Date;
}

export interface INotify {
  headerText: string;
  contentText: string;
  variant?: string;
}

export interface IModal {
  isWin: boolean;
  contentText: string;
}
