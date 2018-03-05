// @flow
import * as React from 'react';
import styled from 'styled-components';


type Props = {};

const Thumbnail = styled.div`
  border: 1px solid #e3e3e3;
  background-color: #fff;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: 4px;
`;

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
                <div className="excerpt small">
                  1 janvier 2015
                </div>
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
            <div className="excerpt small">
              Lorem aque eius excepturi expedita ipptio quasi quisquam sunt tenetur vitae voluptas? Ad, iste.
            </div>
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
        <div className="small txt-center">
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
        </div>
      </Thumbnail>
    );
  }
}

export default CardProposal;
