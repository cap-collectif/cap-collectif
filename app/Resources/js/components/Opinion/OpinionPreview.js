// @flow
import React from 'react';
import UserAvatar from '../User/UserAvatar';
import OpinionInfos from './OpinionInfos';
import OpinionPreviewTitle from './OpinionPreviewTitle';
import OpinionPreviewCounters from './OpinionPreviewCounters';

type Props = {
  opinion: Object,
  rankingThreshold?: null | number,
  link?: boolean,
  showTypeLabel?: boolean,
};

class OpinionPreview extends React.Component<Props> {
  static defaultProps = {
    link: true,
    showTypeLabel: false,
  };

  render() {
    const { rankingThreshold } = this.props;
    const opinion = this.props.opinion;

    return (
      <React.Fragment>
        <UserAvatar user={opinion.author} />
        <div>
          <OpinionInfos rankingThreshold={rankingThreshold} opinion={opinion} />
          <OpinionPreviewTitle {...this.props} />
          <OpinionPreviewCounters {...this.props} />
        </div>
      </React.Fragment>
    );
  }
}

export default OpinionPreview;
