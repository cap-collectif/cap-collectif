// @flow
import * as React from 'react';
import { ProgressBar } from 'react-bootstrap';
import {CardContainer} from "../components/Ui/Card/CardContainer";
import CardType from "../components/Ui/Card/CardType";
import {Progress} from "../components/Ui/Progress";
import CardCover from "../components/Ui/Card/CardCover";
import TagsList from "../components/Ui/List/TagsList";

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
            <h3 className="card__title">
              <a href="#">
                {project.title}
              </a>
            </h3>
            <TagsList>
              <div className="tags-list__tag ellipsis">
                <i className="cap cap-tag-1-1 icon--blue" />
                {project.theme}
              </div>
              <div className="tags-list__tag ellipsis">
                <i className="cap cap-marker-1-1 icon--blue" />
                0 contributions
              </div>
              <div className="tags-list__tag ellipsis">
                <i className="cap cap-marker-1-1 icon--blue" />
                0 participants
              </div>
            </TagsList>
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
