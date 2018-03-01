// @flow
import * as React from 'react';
import styled from 'styled-components';
import { ProgressBar } from 'react-bootstrap';
// import { Col } from 'react-bootstrap';
// import 'bootstrap/dist/css/bootstrap.min.css'
import { FormattedMessage } from 'react-intl';
// import ProjectType from '../Project/Preview/ProjectType';
// import ProjectCover from '../Project/Preview/ProjectCover';
import ProjectPreviewBody from '../Project/Preview/ProjectPreviewBody';

type Props = {};

export const StorybookContainer = styled.div`
  background-color: #F7F7F7;
`; // to remove if i can add stylesheet


const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const Col = styled.div.attrs({
  className: 'col-lg-3 col-md-4 col-sm-6 col-xs-12'
})`
  display: flex;
`;

const Thumbnail = styled.div`
  border: 1px solid #e3e3e3;
  background-color: #fff;
  margin-bottom: 30px;
`;

const Type = styled.div`
  background-color: red;
  border-top-right-radius: 3px;
  border-top-left-radius: 3px;
  text-align: center;
  padding: 2px;
  color: white;
`; // do component

const Body = styled.div`
  padding: 15px;
`;

const Title = styled.h3`
  font-size: 18px;
  line-height: 1.2;
  margin-top: 5px;
`;

const Image = styled.div` 
  width: 100%;
  background: url('https://source.unsplash.com/random') center;
  background-size: cover;
  height: 175px; 
`; // do component

export class Card extends React.Component<Props> {
  static defaultProps = {};

  render() {
    return (
      <StorybookContainer> {/* To remove */}
        <div className="container">
          <Row className="row">
            <Col xs={12} sm={6} md={4} lg={3}>
              <Thumbnail>
                <Type>
                  Mon type
                </Type>
                <Image />
                <Body>
                  <Title>
                    <a href="#">
                      Mon titre
                    </a>
                  </Title>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. A cum deleniti eaque eius excepturi expedita ipsa labore magnam nam, natus odit optio quasi quisquam sunt tenetur vitae voluptas? Ad, iste.
                  </p>
                  <ProgressBar
                    bsStyle="success"
                    now={50}
                    label="en cours"
                  />
                  <ProgressBar
                    bsStyle="success"
                    now={100}
                    label="Participation en continue"
                  />
                  <ProgressBar
                    className="grey_progress-bar"
                    now={100}
                    label="close"
                  />
                </Body>
              </Thumbnail>
            </Col>
            <Col>
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
                    odit optio quasi quisquam sunt tenetur vitae voluptas? Ad, iste.
                  </p>
                </Body>
              </Thumbnail>
            </Col>
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
          </Row>
        </div>
      </StorybookContainer>

    );
  }
}

export default Card;
