// @flow
import * as React from 'react';
import { CardContainer } from '../components/Ui/Card/CardContainer';
import CardType from '../components/Ui/Card/CardType';
import CardCover from '../components/Ui/Card/CardCover';
import CardStatus from '../components/Ui/Card/CardStatus';
import { CardUser } from '../components/Ui/Card/CardUser';

type Props = {
  project: Object,
};

export class Card extends React.Component<Props> {
  render() {
    const { project } = this.props;

    return (
      <CardContainer>
        <CardType color={project.type.color}>{project.type.title}</CardType>
        <CardCover>
          <img src={project.cover} alt={project.title} />
        </CardCover>
        <CardUser>
          <div className="card__user__avatar">
            <img src={project.user.avatar} alt={project.user.name} />
          </div>
          <div>
            <a href="">{project.user.name}</a>
            <p>
              <div className="excerpt small">{project.user.publicationDate}</div>
            </p>
          </div>
          <hr />
        </CardUser>
        <div className="card__body">
          <div className="card__body__infos">
            <h3 className="card__title">
              <a href="#">{project.title}</a>
            </h3>
          </div>
          <div className="card__actions">
            {project.step.actionLink && <a href="">{project.step.actionLink}</a>}
            <span className="excerpt_dark">{project.step.remainingTime.value}</span>{' '}
            <span>{project.step.remainingTime && project.step.remainingTime.label}</span>
          </div>
        </div>
        <div className="card__counters card__counters_multiple">
          <div className="card__counter">
            <div className="card__counter__value">{project.counters.comments.value}</div>
            {project.counters.comments.label}
          </div>
          <div className="card__counter">
            <div className="card__counter__value">{project.counters.votes.value}</div>
            {project.counters.votes.label}
          </div>
        </div>
        <CardStatus className={project.status.color}>{project.status.name}</CardStatus>
      </CardContainer>
    );
  }
}

export default Card;
