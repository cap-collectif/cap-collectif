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

const Body = styled.div`
  display: flex;
  padding: 15px;
  flex: 1 0 auto;
  flex-direction: column;
`;

const BodyInfos = styled.div`
  flex: 1 0 auto;
  margin-bottom: 15px;
`;

const Title = styled.h3`
  font-size: 18px;
  line-height: 1.2;
  margin-top: 5px;
`;

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
      <CardContainer>
        <Image />
        <Body>
          <BodyInfos>
            <Title>
              <a href="#">
                Mon titre
              </a>
            </Title>
            <DotList>
              <li>5 projets</li>
              <li>10 articles</li>
              <li>2 évènements</li>
              <li>4 idées</li>
            </DotList>
            <span className="label label-danger">
              Danger
            </span>
          </BodyInfos>
        </Body>
      </CardContainer>
    );
  }
}

export default CardTheme;
