// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import {ListGroup, ListGroupItem} from "react-bootstrap";
import OpinionPreview from './OpinionPreview';
import OpinionAnswer from './OpinionAnswer';
import OpinionButtons from './OpinionButtons';
import OpinionAppendices from './OpinionAppendices';
import OpinionBody from './OpinionBody';
import OpinionVotesBox from './Votes/OpinionVotesBox';
import OpinionVersion from './OpinionVersion';
import type { OpinionBox_opinion } from './__generated__/OpinionBox_opinion.graphql';

type Props = {
  opinion: OpinionBox_opinion,
  rankingThreshold?: number,
  opinionTerm?: number,
};

export class OpinionBox extends React.Component<Props> {
  getMaxVotesValue = () => {
    return this.getOpinionType().votesThreshold;
  };

  getOpinionType = () => {
    const { opinion } = this.props;
    return this.isVersion() ? opinion.parent.type : opinion.type;
  };

  getBoxLabel = () => {
    const { opinionTerm } = this.props;
    return this.isVersion()
      ? 'opinion.header.version'
      : opinionTerm === 0
        ? 'opinion.header.opinion'
        : 'opinion.header.article';
  };

  isVersion = () => {
    const { opinion } = this.props;
    return opinion && opinion.parent;
  };

  render() {
    const { opinion, opinionTerm, rankingThreshold } = this.props;
    const color = this.getOpinionType().color;
    const parentTitle = this.isVersion() ? opinion.parent.title : this.getOpinionType().title;
    const headerTitle = this.getBoxLabel();

    const backLink = opinion.type.url;
    const colorClass = `opinion opinion--${color} opinion--current`;
    return (
      <div className="block block--bordered opinion__details">
        <div className={colorClass}>
          <div className="opinion__header opinion__header--centered" style={{ height: 'auto' }}>
            <a className="pull-left btn btn-default opinion__header__back" href={backLink}>
              <i className="cap cap-arrow-1-1" />
              <span className="hidden-xs hidden-sm">
                {' '}
                <FormattedMessage id="opinion.header.back" />
              </span>
            </a>
            <div className="opinion__header__title" />
            <h2 className="h4 opinion__header__title">
              <FormattedMessage id={headerTitle} />
              <p className="small excerpt" style={{ marginTop: '5px' }}>
                {parentTitle}
              </p>
            </h2>
          </div>
          <ListGroup className="list-group-custom mb-0">
            <ListGroupItem className="list-group-item__opinion no-border">
              <div className="left-block">
                <OpinionPreview
                  rankingThreshold={rankingThreshold}
                  opinionTerm={opinionTerm}
                  opinion={opinion}
                  link={false}
                />
              </div>
            </ListGroupItem>
          </ListGroup>
        </div>
        <OpinionAppendices opinion={opinion} />
        <div className="opinion__description">
          <p className="h4" style={{ marginTop: '0' }}>
            {opinion.title}
          </p>
          <OpinionBody opinion={opinion} />
          <div
            className="opinion__buttons"
            style={{ marginTop: '15px', marginBottom: '15px' }}
            aria-label={<FormattedMessage id="vote.form" />}>
            <OpinionButtons opinion={opinion} />
          </div>
          <OpinionVotesBox opinion={opinion} />
        </div>
        <OpinionAnswer answer={opinion.answer} />
      </div>
    );
  }
}

export default createFragmentContainer(OpinionBox, {
  opinion: graphql`
    fragment OpinionBox_opinion on Opinion {
      id
      body
      answer
      type {
        color
        votesThreshold
        url
      }
      ... on OpinionVersion {
        parent {
          title
          url
        }
      }
    }
  `,
});