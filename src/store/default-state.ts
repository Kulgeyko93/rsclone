import {
  DEFAULT_FIELD_SIZE,
  DEFAULT_GAMER_NAME,
  DEFAULT_LANG,
  DEFAULT_SECOND_GAMER_NAME,
  PLAYERS_ID,
} from '@constants';
import { IAppState } from '@types';

export const defaultState: IAppState = {
  game: {
    isOnline: false,
    fieldSize: DEFAULT_FIELD_SIZE,
    time: 0,
    isBot: false,
    firstWord: '',
    currentWord: '',
    playerTurnId: PLAYERS_ID.FIRST_GAMER_ID,
    isGameStart: false,
    duration: 0,
    isWin: 0,
    player1: {
      points: 0,
      words: [],
      penalties: 0,
    },
    player2: {
      points: 0,
      words: [],
      penalties: 0,
    },
  },

  settings: {
    lang: DEFAULT_LANG,
    isSoundOn: true,
    isMusicOn: true,
    gamerNames: [DEFAULT_GAMER_NAME, DEFAULT_SECOND_GAMER_NAME],
    currentTheme: 'light',
  },

  rating: {
    field: DEFAULT_FIELD_SIZE,
    withOnline: false,
    withBot: false,
    top: [],
  },

  notify: null,

  modal: null,
};
