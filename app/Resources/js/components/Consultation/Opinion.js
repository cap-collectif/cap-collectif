// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { IntlMixin } from 'react-intl';
import OpinionPreviewTitle from '../Opinion/OpinionPreviewTitle';
import OpinionInfos from '../Opinion/OpinionInfos';
import UserAvatar from '../User/UserAvatar';
import OpinionPreviewCounters from '../Opinion/OpinionPreviewCounters';

export const Opinion = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { opinion } = this.props;
    const author = opinion.author;
    return (
      <li
        className={`opinion has-chart${author && author.vip ? ' bg-vip' : ''}`}>
        <div className="row">
          <div className="col-xs-12  col-sm-8  col-md-9  col-lg-10">
            <div className="opinion__body box" style={{ textAlign: 'left' }}>
              <UserAvatar user={author} className="pull-left" />
              <div className="opinion__data">
                <OpinionInfos rankingThreshold={0} opinion={opinion} />
                <OpinionPreviewTitle
                  showTypeLabel={false}
                  link
                  opinion={opinion}
                />
                <OpinionPreviewCounters opinion={opinion} />
              </div>
            </div>
          </div>
          <div className="hidden-xs col-sm-4  col-md-3  col-lg-2" />
        </div>
      </li>
    );
  },
});

export default createFragmentContainer(
  Opinion,
  graphql`
    fragment Opinion_opinion on Opinion {
      id
      url
      title
      createdAt
      updatedAt
      votesCount
      versionsCount
      connectionsCount
      sourcesCount
      argumentsCount
      author {
        vip
        displayName
        media {
            url
        }
      }
      section {
        title
        versionable
        linkable
        sourceable
        voteWidgetType
      }
    }
  `,
);
