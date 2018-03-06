// @flow
import * as React from 'react';
import { ProgressBar } from 'react-bootstrap';
import {CardContainer} from "../components/Ui/Card/CardContainer";
import CardType from "../components/Ui/Card/CardType";
import {Progress} from "../components/Ui/Progress";
import CardCover from "../components/Ui/Card/CardCover";

type Props = {
  project: Object,
};

export class CardProject extends React.Component<Props> {

  render() {
    const { project } = this.props;

    return (
      <CardContainer>
        <CardType color={project.type.color}>
          {project.type.title}
        </CardType>
        <CardCover>
          <img src={project.cover} alt={project.title}/>
        </CardCover>
        <div className="card__body">
          <div className="card__body__infos">
            <div className="excerpt small">
              {project.theme}
            </div>
            <h3 className="card__title">
              <a href="#">
                {project.title}
              </a>
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
          <div className="card__actions">
            <div className="excerpt">
              <a href="">
                Participer
              </a>
              <span className="excerpt_dark">
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
