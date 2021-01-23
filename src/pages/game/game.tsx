import React, { useState, useEffect, useRef } from 'react';
import './game.scss';
import { Keyboard, Field, WordField, Scores, PlayerWords, GameOverModal, AnimatedText, Sound } from '@components';
import Button from 'react-bootstrap/Button';
import { getLangLetters, Languages, Api, NOTIFY_COLORS, PLAYERS_ID } from '@constants';
import { useSelector, useDispatch } from 'react-redux';
import { useKeyPress, useSymbolKeyPress, useApi } from '@hooks';
import { useTranslation } from 'react-i18next';
import { initCells } from '@utils';
import { IAppState, IGameState, IWordState } from '@types';
import { setGame, nextTurn, setModal, stopGame, startGame } from '@store';
import musicfile from '../../assets/sound/click.mp3';

export const Game = (): JSX.Element => {
  const [enteredLetter, setEnteredLetter] = useState('');
  const [isKeyboardHidden, setIsKeyboardHidden] = useState(true);
  // current focused cell by keyboard / mouse
  const [focusedCell, setFocusedCell] = useState<number | null>(null);
  // a cell with selected new letter
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [currWord, setCurrWord] = useState<string>('');
  const [idsOfChosenLetters, setIdsOfChosenLetters] = useState<Array<number>>([]);
  const [startTime] = useState<Date>(new Date());
  const [isShowAnimation, setIsShowAnimation] = useState(false);
  const [animatedText, setAnimatedText] = useState('');
  const [animatedTextColor, setAnimatedTextColor] = useState('');
  const [isPlay, setIsPlay] = useState<boolean>(false);

  const fieldSize = useSelector((state: IAppState) => state.game.fieldSize);
  const firstWord = useSelector((state: IAppState) => state.game.firstWord);
  const [cells, setCells] = useState(initCells(fieldSize, firstWord));
  const { t } = useTranslation();
  const [infoMessage, setInfoMessage] = useState('');
  const [timerKey, setTimerKey] = useState(0);
  const modal = useSelector((state: IAppState) => state.modal);

  const dispatch = useDispatch();
  const game = useSelector((state: IAppState) => state.game);
  const setGameSettings = (settings: IGameState) => dispatch(setGame(settings));
  const playerTurnId = useSelector((state: IAppState) => state.game.playerTurnId);
  const firstGamerName = useSelector((state: IAppState) => state.settings.gamerNames[PLAYERS_ID.FIRST_GAMER_ID]);
  const secondGamerName = useSelector((state: IAppState) => state.settings.gamerNames[PLAYERS_ID.SECOND_GAMER_ID]);
  const curGamerName = useSelector((state: IAppState) => state.settings.gamerNames[game.playerTurnId]);
  const isGameEnded = useSelector((state: IAppState) => state.game.winnerId !== null);
  const winnerName = useSelector((state: IAppState) => {
    if (game.winnerId !== null) {
      return state.settings.gamerNames[game.winnerId];
    }
    return '';
  });
  const isSoundMuteOn = useSelector((state: IAppState) => state.settings.isSoundOn);

  const { request } = useApi();
  const { url, method } = Api.GET_WORD_INFO;

  // const isSoundOn = useSelector((state: IAppState) => state.settings.isSoundOn);

  const selectedCellRef = useRef<number | null>(null);
  selectedCellRef.current = selectedCell;

  const escPress = useKeyPress('Escape');
  const downPress = useKeyPress('ArrowDown');
  const upPress = useKeyPress('ArrowUp');
  const leftPress = useKeyPress('ArrowLeft');
  const rightPress = useKeyPress('ArrowRight');
  const enterPress = useKeyPress('Enter');
  const shiftPress = useKeyPress('Shift');
  const symbolPressed = useSymbolKeyPress();

  const lang = useSelector((state: IAppState) => state.settings.lang);
  const [language] = Object.keys(Languages).filter((key) => Languages[key as keyof typeof Languages] === lang);

  const setLetterInCells = (letter: string, pos: number) => {
    const newCells = [...cells];
    newCells[pos] = letter;
    setCells(newCells);
  };

  const resetTimer = () => {
    setTimerKey((prevKey: number) => prevKey + 1);
  };

  const resetState = (skipLetterClean?: boolean | null) => {
    if (!skipLetterClean && selectedCellRef.current !== null) {
      setLetterInCells('', selectedCellRef.current);
    }
    setEnteredLetter('');
    setSelectedCell(null);
    setIsKeyboardHidden(true);
    setIdsOfChosenLetters([]);
    setCurrWord('');
  };

  const handleClearButton = () => resetState(false);
  const setNextTurn = () => {
    resetState();
    resetTimer();
    dispatch(nextTurn());
  };

  const setWinner = (winnerId: number) => {
    const gameDuration = new Date().getTime() - startTime.getTime();
    setGameSettings({ ...game, duration: gameDuration, winnerId });
  };

  const updatePoints = (winWord: string, description: string) => {
    const numberOfPoints = winWord.length;

    let firstPlayerPoints = game.player1.points;
    let secondPlayerPoints = game.player2.points;

    if (playerTurnId === PLAYERS_ID.FIRST_GAMER_ID) {
      firstPlayerPoints += numberOfPoints;
      setGameSettings({
        ...game,
        playerTurnId: PLAYERS_ID.SECOND_GAMER_ID,
        ...game.player2,
        player1: {
          ...game.player1,
          points: firstPlayerPoints,
          playerWords: [...game.player1.playerWords, { word: currWord, description }],
        },
      });
    } else {
      secondPlayerPoints += numberOfPoints;
      setGameSettings({
        ...game,
        playerTurnId: PLAYERS_ID.FIRST_GAMER_ID,
        player2: {
          ...game.player2,
          points: secondPlayerPoints,
          playerWords: [...game.player2.playerWords, { word: currWord, description }],
        },
      });
    }

    if (cells.filter((el) => el === '').length === 0) {
      if (firstPlayerPoints > secondPlayerPoints) {
        setWinner(PLAYERS_ID.FIRST_GAMER_ID);
      } else {
        setWinner(PLAYERS_ID.SECOND_GAMER_ID);
      }
    }
  };

  const showAnimationMsg = (textMsg: string, color: string) => {
    setAnimatedTextColor(color);
    setAnimatedText(textMsg);
    setIsShowAnimation(true);
  };

  const checkInDictionary = async (word: string) => {
    try {
      const wordInfo = await request(url(language || lang, word.toLowerCase()), method);
      setInfoMessage(t('game.acceptedFrom', { curGamerName, currWord }));
      updatePoints(currWord, wordInfo.definition);
      resetTimer();
      resetState(true);
      showAnimationMsg(t('game.points', { points: currWord.length }), NOTIFY_COLORS.info);
    } catch (e) {
      showAnimationMsg(t('game.tryAgain'), NOTIFY_COLORS.error);
      resetState();
      setInfoMessage(t('game.notInDictionary', { currWord }));
    }
  };

  const checkUsedWord = (wordObj: Array<IWordState>, wordToCheck: string) =>
    wordObj.filter((el) => el.word === wordToCheck).length !== 0;

  const validateSubmit = (): [string, boolean] | null => {
    if (currWord.length === 0) return [t('game.notChoose'), false];
    if (currWord.length === 1) return [t('game.tooShort'), true];
    if (selectedCell !== null && !idsOfChosenLetters.includes(selectedCell)) {
      return [t('game.mustContain'), true];
    }
    if (checkUsedWord(game.player1.playerWords, currWord)) {
      return [t('game.usedWordFirst', { firstGamerName }), true];
    }
    if (checkUsedWord(game.player2.playerWords, currWord)) {
      return [t('game.usedWordSecond', { secondGamerName }), true];
    }
    return null;
  };

  const handleSubmitButton = () => {
    const validationError = validateSubmit();
    if (validationError != null) {
      const [msg, shouldReset] = validationError;
      if (shouldReset) {
        resetState();
      }
      showAnimationMsg(t('game.tryAgain'), NOTIFY_COLORS.error);
      setInfoMessage(msg);
      return;
    }

    checkInDictionary(currWord);
  };

  const handleCurrentLetter = (letter: string) => {
    if (focusedCell !== null) {
      setSelectedCell(focusedCell);
      setIsKeyboardHidden(true);
      setEnteredLetter(letter);
      setLetterInCells(letter, focusedCell);
    }
  };

  const handleKeyPressLetter = () => {
    if (focusedCell == null || cells[focusedCell] !== '' || enteredLetter) {
      return;
    }
    const currLetters = getLangLetters(lang);
    const letters = currLetters.flat().map((el) => el.name.toUpperCase());
    if (letters.includes(symbolPressed.toUpperCase())) {
      handleCurrentLetter(symbolPressed.toUpperCase());
    }
  };

  const handleMouseSelectCell = (index: number) => {
    if (isGameEnded) return;
    if (!enteredLetter) {
      setFocusedCell(index);
      if (isKeyboardHidden) setIsKeyboardHidden(false);
    } else {
      setIsKeyboardHidden(true);
    }
  };

  const handlePlay = () => setIsPlay(true);

  const handleHideKeyboard = () => setIsKeyboardHidden(true);
  const disableButtons = !isKeyboardHidden || isGameEnded;

  useEffect(() => {
    if (downPress || upPress || leftPress || rightPress) {
      setFocusedCell((prevState: number | null) => {
        if (prevState === null) {
          return 0;
        }

        const moveDownIsPossible = prevState + fieldSize < cells.length;
        const moveUpIsPossible = prevState - fieldSize >= 0;
        const moveLeftIsPossible = prevState - 1 >= 0;
        const moveRightIsPossible = prevState + 1 < cells.length;

        if (downPress && moveDownIsPossible) {
          return prevState + fieldSize;
        }

        if (upPress && moveUpIsPossible) {
          return prevState - fieldSize;
        }

        if (leftPress && moveLeftIsPossible) {
          return prevState - 1;
        }
        if (rightPress && moveRightIsPossible) {
          return prevState + 1;
        }
        return prevState;
      });
    }
  }, [downPress, upPress, leftPress, rightPress]);

  useEffect(() => {
    if (isGameEnded) return;
    if (escPress) resetState();
    const isSelectedCellWithoutLetter = !enteredLetter && focusedCell !== null;
    if (shiftPress && isSelectedCellWithoutLetter) {
      setIsKeyboardHidden(!isKeyboardHidden);
    }
    if (enterPress) {
      handleSubmitButton();
    }
  }, [escPress, enterPress, shiftPress]);

  useEffect(() => {
    if (isGameEnded) return;
    handleKeyPressLetter();
  }, [symbolPressed]);

  useEffect(() => {
    if (game.player2.penalties > 2) {
      setWinner(PLAYERS_ID.FIRST_GAMER_ID);
    } else if (game.player1.penalties > 2) {
      setWinner(PLAYERS_ID.SECOND_GAMER_ID);
    }
  }, [game.player1.penalties, game.player2.penalties]);

  useEffect(() => {
    if (isGameEnded) {
      if (game.isOnline) {
        if (game.winnerId === PLAYERS_ID.BOT_ID) {
          dispatch(setModal({ isWin: false, contentText: t('game.youLose') }));
        } else {
          dispatch(setModal({ isWin: true, contentText: t('game.youWon') }));
        }
      } else {
        dispatch(setModal({ isWin: true, contentText: t('game.nameWon', { winnerName }) }));
      }
    }
  }, [game.winnerId]);

  const setGameIsStart = React.useCallback(() => dispatch(startGame()), [dispatch]);
  const setGameIsStop = React.useCallback(() => dispatch(stopGame()), [dispatch]);

  useEffect(() => {
    setGameIsStart();
    setInfoMessage(t('game.enterLetter'));
    showAnimationMsg(t('game.gameStarted'), NOTIFY_COLORS.info);
    return () => {
      setGameIsStop();
    };
  }, []);

  return (
    <div className="main-game">
      <Scores onTimerComplete={setNextTurn} timerKey={timerKey} />
      <div className="game">
        <PlayerWords playerId={PLAYERS_ID.FIRST_GAMER_ID} />
        <div className="field-area">
          <Keyboard
            setCurrentLetter={handleCurrentLetter}
            isKeyboardHidden={isKeyboardHidden}
            handleHideKeyboard={handleHideKeyboard}
          />
          <div>
            <Field
              handleMouseSelectCell={handleMouseSelectCell}
              selectedCell={selectedCell}
              focusedCell={focusedCell}
              setCurrWord={setCurrWord}
              idsOfChosenLetters={idsOfChosenLetters}
              setIdsOfChosenLetters={setIdsOfChosenLetters}
              canSelect={enteredLetter !== ''}
              cells={cells}
            />
            <WordField currWord={currWord} infoMessage={infoMessage} />
            <div className="buttons">
              <Button
                disabled={disableButtons}
                onClick={() => {
                  handleClearButton();
                  handlePlay();
                }}
                variant="success"
              >
                {t('buttons.cancel')}
              </Button>
              <Button
                disabled={disableButtons}
                onClick={() => {
                  setNextTurn();
                  handlePlay();
                }}
                variant="danger"
              >
                {t('buttons.skip')}
              </Button>
              <Button
                disabled={disableButtons}
                onClick={() => {
                  handleSubmitButton();
                  handlePlay();
                }}
                variant="success"
              >
                {t('buttons.submit')}
              </Button>
              <Sound
                src={musicfile}
                playing={isPlay}
                format={['mp3']}
                loop={false}
                mute={!isSoundMuteOn}
                onEnd={setIsPlay}
              />
            </div>
          </div>
        </div>
        <PlayerWords playerId={PLAYERS_ID.SECOND_GAMER_ID} />
        <AnimatedText
          isShow={isShowAnimation}
          setIsShowAnimation={setIsShowAnimation}
          text={animatedText}
          colorMsg={animatedTextColor}
        />
      </div>
      {modal ? <GameOverModal modal={modal} /> : null}
    </div>
  );
};
