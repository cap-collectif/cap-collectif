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

const BodyUser = styled.div`
  hr {
    margin: 15px 0 5px;
  }
`; // do component

const UserAvatar = styled.div` 
  float: left;
  margin-right: 10px;
  width: 45px;
  height: 45px;
  background-color: red;
  border-radius: 50%;
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

const Tag = styled.div`
  padding: 5px 0 0 5px; 
  font-size: 14px;
  
  .cap {
    padding-right: 5px;
  }
`;

const Footer = styled.div`
  text-align: center;
  font-size: 14px;
`;

const Counters = styled.div`
  padding: 5px;
  background-color: #f6f6f6;
  border-top: 1px solid #e3e3e3;
`;

const Counter = styled.div`
  
`;

const Value = styled.div`
  font-size: 18px;
`;

const Label = styled.div`
  
`;
const Status = styled.div`
  background-color: #707070;
  color: #fff;
  padding: 3px;
  border-radius: 0 0 4px 4px;
`;

export class CardProposal extends React.Component<Props> {
  static defaultProps = {};

  render() {
    return (
      <Thumbnail>
        <Body>
          <BodyUser>
            <UserAvatar />
            <div>
              <a href="">welcomattic</a>
              <p>
                <Excerpt>
                  1 janvier 2015
                </Excerpt>
              </p>
            </div>
            <hr/>
          </BodyUser>
          <BodyInfos>
            <Title>
              <a href="#">
                Mon titre
              </a>
            </Title>
            <Excerpt>
              Lorem aque eius excepturi expedita ipptio quasi quisquam sunt tenetur vitae voluptas? Ad, iste.
            </Excerpt>
            <Tag>
              <i className="cap glyphicon glyphicon-pushpin" /> {/* replace by true icons */}
              Justice
            </Tag>
            <Tag>
              <i className="cap glyphicon glyphicon-fire" />
              Maurepas Patton
            </Tag>
          </BodyInfos>
        </Body>
        <Footer>
          <Counters>
            <Counter>
              <Value>
                15
              </Value>
              <Label>
                commentaires
              </Label>
            </Counter>
          </Counters>
          <Status>
            Aucun statut
          </Status>
        </Footer>
      </Thumbnail>
    );
  }
}

export default CardProposal;
