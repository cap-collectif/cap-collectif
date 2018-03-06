// @flow
import * as React from 'react';
import styled from 'styled-components';
import { CardContainer } from '../components/Ui/Card/CardContainer';

type Props = {};

const Image = styled.div` 
  width: 100%;
  background: url('https://source.unsplash.com/random') center;
  background-size: cover;
  height: 175px; 
`; // do component

const DotList = styled.ul.attrs({
  className: 'excerpt'
})`
  li::after {
    content: "•";
    padding: 0 .1em;
  }
  
  li:lastchild::after {
    content: '';
    padding: 0;
  }
`;

export class CardTheme extends React.Component<Props> {
  static defaultProps = {};

  render() {
    return (
      <CardContainer className="text-center">
        <Image />
        <div className="card__body">
          <div className="card__body__infos">
            <h3 className="card__title">
              <a href="#">
                Mon titre
              </a>
            </h3>
            <DotList>
              <li>5 projets</li>
              <li>10 articles</li>
              <li>2 évènements</li>
              <li>4 idées</li>
            </DotList>
            <span className="label label-danger">
              Danger
            </span>
          </div>
        </div>
      </CardContainer>
    );
  }
}

export default CardTheme;
