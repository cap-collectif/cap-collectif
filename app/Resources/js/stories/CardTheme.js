// @flow
import * as React from 'react';
import styled from 'styled-components';
import { CardContainer } from '../components/Ui/Card/CardContainer';
import DotList from "../components/Ui/List/DotList";
import CardCover from "../components/Ui/Card/CardCover";

type Props = {
  theme: Object,
};

export class CardTheme extends React.Component<Props> {
  render() {
    const { theme } = this.props;

    return (
      <CardContainer className="text-center">
        <CardCover>
          <img src={theme.cover} alt={theme.title}/>
        </CardCover>
        <div className="card__body">
          <div className="card__body__infos">
            <h3 className="card__title">
              <a href="#">
                {theme.title}
              </a>
            </h3>
            <DotList>
              <li>5 projets</li>
              <li>10 articles</li>
              <li>2 évènements</li>
              <li>4 idées</li>
            </DotList>
            <span className={`label label-${theme.label}`}>
              {theme.label}
            </span>
          </div>
        </div>
      </CardContainer>
    );
  }
}

export default CardTheme;
