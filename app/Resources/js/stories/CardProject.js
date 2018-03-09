// @flow
import * as React from 'react';
import { ProgressBar } from 'react-bootstrap';
import { CardContainer } from '../components/Ui/Card/CardContainer';
import CardType from '../components/Ui/Card/CardType';
import { Progress } from '../components/Ui/Progress';
import CardCover from '../components/Ui/Card/CardCover';
import TagsList from '../components/Ui/List/TagsList';
import InlineList from '../components/Ui/List/InlineList';

type Props = {
  project: Object,
};

export class CardProject extends React.Component<Props> {
  render() {
    const { project } = this.props;

    return (
      <CardContainer>
        <CardType color={project.type.color}>{project.type.title}</CardType>
        <CardCover>
          <img src={project.cover} alt={project.title} />
        </CardCover>
        <div className="card__body">
          <div className="card__body__infos">
            <InlineList className="small">
              {project.theme.map(theme => <li>{theme}</li>)}
            </InlineList>
            <h3 className="card__title">
              <a href="#">{project.title}</a>
            </h3>
            <TagsList>
              <div className="tags-list__tag">
                <i className="cap cap-baloon-1 icon--blue" />
                {project.tags.contributions}
              </div>
              <div className="tags-list__tag">
                <i className="cap cap-hand-like-2-1 icon--blue" />
                {project.tags.participations}
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
            {project.step.actionLink && <a href="">{project.step.actionLink}</a>}
            <span className="excerpt_dark">{project.step.remainingTime.value}</span>{' '}
            <span>{project.step.remainingTime && project.step.remainingTime.label}</span>
          </div>
        </div>
      </CardContainer>
    );
  }
}

export default CardProject;
