import { Link } from 'react-router-dom';
import { routes } from '../../routes';
import './main.css';

export const Main = () => {
  return (
    <ul>
      <li>
        <Link to={routes.SET_GAME}>New Game</Link>
      </li>
      <li>
        <Link to={routes.RATING}>Rating</Link>
      </li>
      <li>
        <Link to={routes.SETTINGS}>Settings</Link>
      </li>
      <li>
        <Link to={routes.ABOUT}>About</Link>
      </li>
    </ul>
  );
};
