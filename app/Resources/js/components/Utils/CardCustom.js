// @flow
import * as React from 'react';
import styled from 'styled-components';
import Progress from './Progress';
// import {UserAvatar} from "../User/UserAvatar";
// import UserLink from "../User/UserLink";
// import { FormattedMessage } from 'react-intl';

type Props = {};

// const Row = styled.div`
//   display: flex;
//   flex-wrap: wrap;
// `;
//
// const Col = styled.div.attrs({
//   className: 'col-lg-3 col-md-4 col-sm-6 col-xs-12'
// })`
//   display: flex;
// `;

const Thumbnail = styled.div`
  border: 1px solid #e3e3e3;
  background-color: #fff;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

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

// const Excerpt = styled.span`
//   font-size: 14px;
//   color: #707070;
//
//   span {
//     color: #212529;
//   }
//
//   a {
//     color: #707070;
//   }
// `;

const Title = styled.h3`
  font-size: 18px;
  line-height: 1.2;
  margin-top: 5px;
`;

export class CardCustom extends React.Component<Props> {
  static defaultProps = {};

  render() {
    return (
      <Thumbnail>
        <Image />
        <Body>
          <BodyInfos>
            <Title>
              <a href="#">
                Customized Card
              </a>
            </Title>
            <div className="excerpt">
              Lorem aque eius excepturi expedita ipptio quasi quisquam sunt tenetur vitae voluptas? Ad, iste.
            </div>
          </BodyInfos>
        </Body>
      </Thumbnail>
    );
  }
}

export default CardCustom;
