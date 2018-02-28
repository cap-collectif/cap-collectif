// @flow
import * as React from 'react';
import styled from 'styled-components';
import { Col } from 'react-bootstrap';
// import 'bootstrap/dist/css/bootstrap.min.css'
// import { FormattedMessage } from 'react-intl';
// import ProjectType from '../Project/Preview/ProjectType';
// import ProjectCover from '../Project/Preview/ProjectCover';
// import ProjectPreviewBody from '../Project/Preview/ProjectPreviewBody';

type Props = {};

export const StorybookContainer = styled.div.attrs({
  className: 'row',
})`
  background-color: #F7F7F7;
`;

export const Container = styled.div`
  width: 260px;
`; // to remove if we have bootstrap

// export const Col = styled.div.attrs({
//   className: 'col-lg-3 col-md-4 col-sm-6 col-xs-12',
// })`
//
// `;

export const Type = styled.div`
  background-color: red;
  border-top-right-radius: 3px;
  border-top-left-radius: 3px;
  text-align: center;
  padding: 2px;
  color: white;
`; // do component

export const Thumbnail = styled.div`
  border: 1px solid #e3e3e3;
  background-color: #fff;
`;

export const Body = styled.div`
  padding: 15px;
  
`;

export const Title = styled.h3`
  font-size: 1.25rem;
  line-height: 1.2;
  margin: 1.25rem 0 .5rem;
`;

export const Image = styled.div` 
  width: 100%;
  background: url('https://source.unsplash.com/random') center;
  background-size: cover;
  height: 175px; 
`; // do component

export class Card extends React.Component<Props> {
  static defaultProps = {};

  render() {
    return (
      <StorybookContainer>
        <Container>
          <div className="row" >
            <Col xs={12} sm={6} md={4} lg={3}>
              <Thumbnail>
                <Type>
                  Mon type
                </Type>
                <Image />
                <Body>
                <Title>
                  Mon titre
                </Title>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. A cum deleniti eaque eius excepturi expedita ipsa labore magnam nam, natus odit optio quasi quisquam sunt tenetur vitae voluptas? Ad, iste.
                </p>
                </Body>
              </Thumbnail>
            </Col>
          </div>
        </Container>
      </StorybookContainer>

    );
  }
}

export default Card;
