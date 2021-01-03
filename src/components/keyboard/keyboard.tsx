import React from 'react';
import './keyboard.scss';
import { getLangLetters } from '@constants';
import { IKeyboardLang, IAppState } from '@types';
import { useSelector } from 'react-redux';
import Button from 'react-bootstrap/Button';

type KeyboardProps = {
  setCurrentLetter: (letter: string) => void;
  handleIsKeyboardHidden: (event: React.MouseEvent) => void;
  isKeyboardHidden: boolean;
};

export const Keyboard = ({
  setCurrentLetter,
  isKeyboardHidden,
  handleIsKeyboardHidden,
}: KeyboardProps): JSX.Element => {
  const lang = useSelector((state: IAppState) => state.settings.lang);
  const currLetters = getLangLetters(lang);

  const handleClick = (event: React.MouseEvent) => {
    setCurrentLetter((event.target as HTMLTextAreaElement).value);
  };

  const renderLettersRow = (row: Array<IKeyboardLang>) =>
    /* eslint-disable implicit-arrow-linebreak */
    row.map((letter) => (
      <button type="button" key={letter.name} className="keyboard__key" value={letter.name} onClick={handleClick}>
        {letter.name}
      </button>
    ));

  const renderLetters = () =>
    currLetters.map((row: Array<IKeyboardLang>, i: number) => (
      /* eslint-disable  react/no-array-index-key */
      <div key={`row-${i}`} className="keyboard__row">
        {renderLettersRow(row)}
      </div>
    ));

  return (
    <div className={isKeyboardHidden ? 'keyboard keyboard-hidden' : 'keyboard'}>
      {renderLetters()}
      <Button className="mt-2" onClick={handleIsKeyboardHidden}>
        Close
      </Button>
    </div>
  );
};
