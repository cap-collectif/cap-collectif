// @flow
import * as React from 'react';
import styled from 'styled-components';
import Progress from './Progress';

type Props = {};

const Thumbnail = styled.div`
  border: 1px solid #e3e3e3;
  background-color: #fff;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Type = styled.div`
  background-color: rgb(91, 192, 222);
  border-top-right-radius: 3px;
  border-top-left-radius: 3px;
  text-align: center;
  padding: 2px;
  color: white;
`; // do component

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

const BodyActions = styled.div`
   color: #707070;
   font-size: 14px;

  a {
    text-transform: uppercase;
    margin-right: 10px;
  }
 
  .remaining-time__number {
    color: #212529;
  }
`;

const Excerpt = styled.span`
  font-size: 14px;
  color: #707070;
  
  span {
    color: #212529;
  }
  
  a {
    color: #707070;
  }
`;

const Title = styled.h3`
  font-size: 18px;
  line-height: 1.2;
  margin-top: 5px;
`;

export class CardProject extends React.Component<Props> {
  static defaultProps = {};

  render() {
    return (
      <Thumbnail>
        <Type>
          Mon type
        </Type>
        <Image />
        <Body>
          <BodyInfos>
            <Excerpt>
              Immobilier, Transport
            </Excerpt>
            <Title>
              <a href="#">
                Mon titre
              </a>
            </Title>
            <div>
              <Excerpt>
                <span>0</span> contribution
              </Excerpt>
            </div>
            <div>
              <Excerpt>
                <span>0</span> participant
              </Excerpt>
            </div>
          </BodyInfos>
          <Progress
            bsStyle="success"
            now={50}
            label="en cours"
            className={null}
          />
          <BodyActions>
            <div className="remaining-time__container">
              <a href="">
                Participer
              </a>
              <span className="remaining-time__number">
                10
              </span>{' '}
              <span>
                jours restants {/* <remainingTime /> */}
              </span>
            </div>
          </BodyActions>
        </Body>
      </Thumbnail>
    );
  }
}

export default CardProject;
