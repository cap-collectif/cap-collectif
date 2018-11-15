// @flow
import * as React from 'react';
import { CardContainer } from '../components/Ui/Card/CardContainer';
import { CardUser } from '../components/Ui/Card/CardUser';
import CardStatus from '../components/Ui/Card/CardStatus';
import TagsList from '../components/Ui/List/TagsList';

type Props = {
  proposal: Object,
};

export class CardProposal extends React.Component<Props> {
  render() {
    const { proposal } = this.props;

    return (
      <CardContainer>
        <CardUser>
          <div className="card__user__avatar">
            <img src={proposal.user.avatar} alt={proposal.user.name} />
          </div>
          <div>
            <a href="https://ui.cap-collectif.com">{proposal.user.name}</a>
            <p>
              <div className="excerpt small">{proposal.user.publicationDate}</div>
            </p>
          </div>
          <hr />
        </CardUser>
        <div className="card__body">
          <div className="card__body__infos">
            <h3 className="card__title">
              <a href="https://ui.cap-collectif.com">{proposal.title}</a>
            </h3>
            <div className="excerpt small">{proposal.content}</div>
            <TagsList>
              <div className="tags-list__tag">
                <i className="cap cap-tag-1-1 icon--blue" />
                {proposal.tags.tag}
              </div>
              <div className="tags-list__tag">
                <i className="cap cap-marker-1-1 icon--blue" />
                {proposal.tags.localisation}
              </div>
            </TagsList>
          </div>
        </div>
        <div className="card__counters card__counters_multiple">
          <div className="card__counter">
            <div className="card__counter__value">{proposal.counters.comments.value}</div>
            {proposal.counters.comments.label}
          </div>
          <div className="card__counter">
            <div className="card__counter__value">{proposal.counters.votes.value}</div>
            {proposal.counters.votes.label}
          </div>
        </div>
        <CardStatus className={proposal.status.color}>{proposal.status.name}</CardStatus>
      </CardContainer>
    );
  }
}

export default CardProposal;
