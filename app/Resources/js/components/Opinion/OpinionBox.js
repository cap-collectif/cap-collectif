// @flow
import React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import OpinionPreview from './OpinionPreview';
import OpinionAnswer from './OpinionAnswer';
import OpinionButtons from './OpinionButtons';
import OpinionAppendices from './OpinionAppendices';
import OpinionBody from './OpinionBody';
import OpinionVotesBox from './Votes/OpinionVotesBox';
import type { State, OpinionAndVersion } from '../../types';

type Props = {
  opinion: Object,
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
    const { opinionTerm, rankingThreshold } = this.props;
    const opinion = this.props.opinion;
    const color = this.getOpinionType().color;
    const parentTitle = this.isVersion() ? opinion.parent.title : this.getOpinionType().title;
    const headerTitle = this.getBoxLabel();

    const colorClass = `opinion opinion--${color} opinion--current`;
    return (
      <div className="block block--bordered opinion__details">
        <div className={colorClass}>
          <div className="opinion__header opinion__header--centered" style={{ height: 'auto' }}>
            <a className="pull-left btn btn-default opinion__header__back" href={opinion.backLink}>
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
          <OpinionPreview
            rankingThreshold={rankingThreshold}
            opinionTerm={opinionTerm}
            opinion={opinion}
            link={false}
          />
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

const mapStateToProps: MapStateToProps<*, *, *> = (
  state: State,
  props: { opinion: OpinionAndVersion },
) => ({
  opinion: {
    ...props.opinion,
    ...(Object.keys(state.opinion.opinionsById).length
      ? state.opinion.opinionsById[props.opinion.id]
      : state.opinion.versionsById[props.opinion.id]),
  },
});

export default connect(mapStateToProps)(OpinionBox);
