import { useSelector } from 'react-redux';
import { IAppState } from '@types';
import './set-game.css';

export const SetGame = () => {
  const lang = useSelector((state: IAppState) => state.lang);

  return <div>SetGame {lang}</div>;
};
