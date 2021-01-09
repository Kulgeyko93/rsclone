import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Button from 'react-bootstrap/esm/Button';
import Form from 'react-bootstrap/esm/Form';
import { useSelector, useDispatch } from 'react-redux';
import { IAppState, IGameState } from '@types';
import { Redirect } from 'react-router-dom';
import { routes } from '@constants';
import { setGame } from '@store';
import { RadioGroup } from '@components';
import './set-game.scss';

export const SetGame = (): JSX.Element => {
  const { t } = useTranslation();
  const game = useSelector((state: IAppState) => state.game);
  const [isFormSubmit, setFormSubmit] = React.useState(false);

  const dispatch = useDispatch();
  const setGameSettings = (settings: IGameState) => dispatch(setGame(settings));

  const sizes = [3, 4, 5, 6, 7, 8, 9];

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const time = +form.time.value.trim();
    const fieldSize = +form.fieldSize.value.trim();
    const firstWord = form.firstWord.value.trim();
    const secondPlayer = form.secondPlayer.value.trim();

    setGameSettings({
      ...game,
      time,
      isBot: secondPlayer === 'bot',
      fieldSize,
      firstWord,
    });

    setFormSubmit(true);
  };

  return (
    <div className="set-game">
      {isFormSubmit && <Redirect to={routes.GAME} />}
      <Form onSubmit={(event) => handleSubmit(event)}>
        <RadioGroup
          controlId="fieldSize"
          groupLabel={t('settings.field-size')}
          name="fieldSize"
          items={sizes.map((size) => {
            const isCurrentSize = game.fieldSize === size;
            return {
              id: `fieldSize-${size}`,
              label: `${size}`,
              value: `${size}`,
              defaultChecked: isCurrentSize,
            };
          })}
        />

        <RadioGroup
          controlId="secondPlayer"
          groupLabel={t('settings.second-player')}
          name="secondPlayer"
          items={[
            {
              id: 'secondPlayer-bot',
              label: t('settings.bot'),
              value: 'bot',
              defaultChecked: false,
            },
            {
              id: 'secondPlayer-human',
              label: t('settings.human'),
              value: 'human',
              defaultChecked: true,
            },
          ]}
        />
        <Form.Group controlId="firstWord">
          <Form.Label>{t('settings.first-word')}</Form.Label>
          <Form.Control type="text" value="balda" name="firstWord" readOnly />
        </Form.Group>
        <Form.Group controlId="time">
          <Form.Label>{t('settings.time')}</Form.Label>
          <Form.Control type="number" defaultValue={game.time} min="0" max="10" name="time" />
        </Form.Group>
        <Button variant="primary" type="submit">
          {t('game.start')}
        </Button>
      </Form>
    </div>
  );
};
