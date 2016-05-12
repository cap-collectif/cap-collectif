import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import OpinionPreview from './OpinionPreview';
import OpinionAnswer from './OpinionAnswer';
import OpinionButtons from './OpinionButtons';
import OpinionAppendices from './OpinionAppendices';
import OpinionBody from './OpinionBody';
import OpinionVotesBox from './Votes/OpinionVotesBox';

const OpinionBox = React.createClass({
  propTypes: {
    opinion: PropTypes.object.isRequired,
    rankingThreshold: PropTypes.number,
    opinionTerm: PropTypes.number,
  },
  mixins: [IntlMixin],

  getMaxVotesValue() {
    return this.getOpinionType().votesThreshold;
  },

  getOpinionType() {
    return this.isVersion() ? this.props.opinion.parent.type : this.props.opinion.type;
  },

  getBoxLabel() {
    return this.isVersion() ? 'opinion.header.version'
      : this.props.opinionTerm === 0
        ? 'opinion.header.opinion'
        : 'opinion.header.article'
    ;
  },

  isVersion() {
    return this.props.opinion && this.props.opinion.parent;
  },

  render() {
    const opinion = this.props.opinion;
    const color = this.getOpinionType().color;
    const backLink = this.isVersion() ? opinion.parent._links.show : opinion._links.type;
    const backTitle = this.isVersion() ? opinion.parent.title : this.getOpinionType().title;
    const headerTitle = this.getBoxLabel();

    const colorClass = 'opinion opinion--' + color + ' opinion--current';
    return (
      <div className="block block--bordered opinion__details">
        <div className={colorClass}>
          <div className="opinion__header opinion__header--centered">
            <a className="pull-left btn btn-default opinion__header__back" href={backLink}>
              <i className="cap cap-arrow-1-1"></i>
              <span className="hidden-xs hidden-sm"> {backTitle}</span>
            </a>
            <h2 className="h4 opinion__header__title">{this.getIntlMessage(headerTitle)}</h2>
          </div>
          <OpinionPreview rankingThreshold={this.props.rankingThreshold} opinionTerm={this.props.opinionTerm} opinion={opinion} link={false} />
        </div>
        <OpinionAppendices opinion={opinion} />
        <div className="opinion__description">
          <p className="h4" style={{ marginTop: '0' }}>{opinion.title}</p>
          <OpinionBody opinion={opinion} />
          <div className="opinion__buttons" style={{ marginTop: '15px', marginBottom: '15px' }} aria-label={this.getIntlMessage('vote.form')}>
            <OpinionButtons opinion={opinion} />
          </div>
          <OpinionVotesBox opinion={opinion} />
        </div>
        <OpinionAnswer answer={opinion.answer} />
      </div>
    );
  },

});

export default OpinionBox;
