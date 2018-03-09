// @flow
import * as React from 'react';
import { CardContainer } from '../components/Ui/Card/CardContainer';
import InlineList from '../components/Ui/List/InlineList';
import CardCover from '../components/Ui/Card/CardCover';

type Props = {
  theme: Object,
};

export class CardTheme extends React.Component<Props> {
  render() {
    const { theme } = this.props;

    return (
      <CardContainer className="text-center">
        <CardCover>
          <img src={theme.cover} alt={theme.title} />
        </CardCover>
        <div className="card__body">
          <div className="card__body__infos">
            <h3 className="card__title">
              <a href="#">{theme.title}</a>
            </h3>
            <InlineList>{theme.counters.list.map(counter => <li>{counter}</li>)}</InlineList>
          </div>
          <div>
            <span className={`label label-${theme.label}`}>{theme.label}</span>
          </div>
        </div>
      </CardContainer>
    );
  }
}

export default CardTheme;
