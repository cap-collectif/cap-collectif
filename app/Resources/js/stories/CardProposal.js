// @flow
import * as React from 'react';
import styled from 'styled-components';
import {CardContainer} from "../components/Ui/Card/CardContainer";
import {CardUser} from "../components/Ui/Card/CardUser";
import CardStatus from "../components/Ui/Card/CardStatus";
import TagsList from "../components/Ui/List/TagsList";


type Props = {
  proposal: Object,
};

export class CardProposal extends React.Component<Props> {
  static defaultProps = {};

  render() {
    const { proposal } = this.props;

    return (
      <CardContainer>
        <CardUser>
          <div className="card__user__avatar">
            <img src={proposal.user.avatar} alt={proposal.user.name}/>
          </div>
          <div>
            <a href="">{proposal.user.name}</a>
            <p>
              <div className="excerpt small">
                1 janvier 2015
              </div>
            </p>
          </div>
          <hr/>
        </CardUser>
        <div className="card__body">
          <div className="card__body__infos">
            <h3 className="card__title">
              <a href="#">
                {proposal.title}
              </a>
            </h3>
            <div className="excerpt small">
              Lorem aque eius excepturi expedita ipptio quasi quisquam sunt tenetur vitae voluptas? Ad, iste.
            </div>
            <TagsList>
              <div className="tags-list__tag ellipsis">
                <i className="cap cap-tag-1-1 icon--blue" />
                Justice
              </div>
              <div className="tags-list__tag ellipsis">
                <i className="cap cap-marker-1-1 icon--blue" />
                Maurepas Patton
              </div>
              <hr/>
              <div className="tags-list__tag ellipsis">
                <i className="cap cap-marker-1-1 icon--blue" />
                15 commentaires
              </div>
            </TagsList>
          </div>
        </div>
        <CardStatus className={proposal.status.color}>
          {proposal.status.name}
        </CardStatus>
      </CardContainer>
    );
  }
}

export default CardProposal;
