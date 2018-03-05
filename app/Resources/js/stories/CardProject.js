// @flow
import * as React from 'react';
import styled from 'styled-components';
import { ProgressBar } from 'react-bootstrap';
import {CardContainer} from "../components/Ui/Card/CardContainer";
import CardType from "../components/Ui/Card/CardType";
import {Progress} from "../components/Ui/Progress";

type Props = {
  project: Object,
};

const Image = styled.div` 
  width: 100%;
  background: url('https://source.unsplash.com/random') center;
  background-size: cover;
  height: 175px; 
`; // do component

export class CardProject extends React.Component<Props> {
  static defaultProps = {
    project: {
      title: "Mon projet",
      type: {
        title: "Consultation",
        color: "#337ab7"
      },
      step: {
        bsStyle: "success",
        now: 80,
        label: "en cours",
        className: null,
      }
    }
  };

  render() {
    const { project } = this.props;

    return (
      <CardContainer>
        <CardType color={project.type.color}>
          {project.type.title}
        </CardType>
        <Image />
        <div className="card__body">
          <div className="card__body__infos">
            <div className="excerpt small">
              Immobilier, Transport
            </div>
            <h3>
              {project.title}
            </h3>
            <div className="excerpt small">
              <span className="excerpt_dark">0</span> contribution
            </div>
            <div className="excerpt small">
              <span className="excerpt_dark">0</span> participant
            </div>
          </div>
          <Progress>
            <ProgressBar
              bsStyle={project.step.bsStyle}
              now={project.step.now}
              label={project.step.label}
              className={project.step.className}
            />
          </Progress>
          <div className="card__body__actions">
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
          </div>
        </div>
      </CardContainer>
    );
  }
}

export default CardProject;
