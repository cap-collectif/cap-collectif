// @flow
import * as React from 'react';
import styled from 'styled-components';
import { CardContainer } from "../components/Ui/Card/CardContainer";

type Props = {};

const Image = styled.div` 
  width: 100%;
  background: url('https://source.unsplash.com/random') center;
  background-size: cover;
  height: 175px; 
`; // do component

export class CardCustom extends React.Component<Props> {
  static defaultProps = {};

  render() {
    return (
      <CardContainer>
        <Image />
        <div className="card__body">
          <div className="card__body__infos">
            <h3 className="card__title">
              <a href="#">
                Customized Card
              </a>
            </h3>
            <div className="excerpt small">
              Lorem aque eius excepturi expedita ipptio quasi quisquam sunt tenetur vitae voluptas?
            </div>
          </div>
        </div>
      </CardContainer>
    );
  }
}

export default CardCustom;
