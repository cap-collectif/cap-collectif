// @flow
import React, { PropTypes } from 'react';
import UserAvatar from '../User/UserAvatar';
import OpinionInfos from './OpinionInfos';
import OpinionPreviewTitle from './OpinionPreviewTitle';
import OpinionPreviewCounters from './OpinionPreviewCounters';

const OpinionPreview = React.createClass({
  propTypes: {
    opinion: PropTypes.object.isRequired,
    rankingThreshold: PropTypes.oneOfType([PropTypes.oneOf([null]), PropTypes.number]),
    link: PropTypes.bool,
    showTypeLabel: PropTypes.bool,
  },

  getDefaultProps() {
    return {
      link: true,
      showTypeLabel: false,
    };
  },

  render() {
    const { rankingThreshold } = this.props;
    const opinion = this.props.opinion;

    return (
      <div className="opinion__body box">
        <UserAvatar user={opinion.author} className="pull-left" />
        <div className="opinion__data">
          <OpinionInfos rankingThreshold={rankingThreshold} opinion={opinion} />
          <OpinionPreviewTitle {...this.props} />
          <OpinionPreviewCounters {...this.props} />
        </div>
      </div>
    );
  },
});

export default OpinionPreview;
