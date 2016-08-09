import React from 'react';
import { IntlMixin } from 'react-intl';
import UserAvatar from '../User/UserAvatar';
import OpinionInfos from './OpinionInfos';
import OpinionPreviewTitle from './OpinionPreviewTitle';
import OpinionPreviewCounters from './OpinionPreviewCounters';

const OpinionPreview = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
    rankingThreshold: React.PropTypes.number,
    link: React.PropTypes.bool,
    showTypeLabel: React.PropTypes.bool,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      link: true,
      showTypeLabel: false,
      rankingThreshold: null,
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
