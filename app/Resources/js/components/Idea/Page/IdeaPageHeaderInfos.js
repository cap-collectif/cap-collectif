import React, { PropTypes } from 'react';
import { FormattedMessage, FormattedDate } from 'react-intl';
import moment from 'moment';
import { connect } from 'react-redux';
import UserLink from '../../User/UserLink';

export const IdeaPageHeaderInfos = React.createClass({
  propTypes: {
    idea: PropTypes.object.isRequired,
    features: PropTypes.object.isRequired,
  },

  render() {
    const { idea, features } = this.props;

    const createdDate = (
      <FormattedDate
        value={moment(idea.createdAt)}
        day="numeric"
        month="long"
        year="numeric"
        hour="numeric"
        minute="numeric"
      />
    );
    const updatedDate = (
      <FormattedDate
        value={moment(idea.updatedAt)}
        day="numeric"
        month="long"
        year="numeric"
        hour="numeric"
        minute="numeric"
      />
    );
    const themeLink =
      idea.theme && features.themes ? (
        <a href={idea.theme._links.show}>{idea.theme.title}</a>
      ) : null;

    return (
      <p className="media--aligned excerpt">
        {themeLink ? (
          <FormattedMessage
            id="idea.header.infos"
            values={{
              user: <UserLink user={idea.author} />,
              created: createdDate,
              theme: themeLink,
            }}
          />
        ) : (
          <FormattedMessage
            id="idea.header.infos_no_theme"
            values={{
              user: <UserLink user={idea.author} />,
              created: createdDate,
            }}
          />
        )}
        {moment(idea.updatedAt).diff(idea.createdAt, 'seconds') > 1 ? (
          <span>
            {' • '}
            <FormattedMessage
              id="global.edited_on"
              values={{
                updated: updatedDate,
              }}
            />
          </span>
        ) : null}
        {idea.commentable ? (
          <span>
            {' | '}
            <a href="#comments" id="idea-comments-nb">
              <FormattedMessage
                id="idea.header.comments"
                values={{
                  num: idea.commentsCount,
                }}
              />
            </a>
          </span>
        ) : null}
        <span>
          {' | '}
          <a href="#votes" id="idea-votes-nb">
            <FormattedMessage
              id="idea.header.votes"
              values={{
                num: idea.votesCount,
              }}
            />
          </a>
        </span>
        {idea.trashed ? (
          <span className="label label-default" style={{ marginLeft: '5px' }}>
            {<FormattedMessage id="idea.header.trashed" />}
          </span>
        ) : null}
      </p>
    );
  },
});

const mapStateToProps = state => {
  return {
    features: state.default.features,
  };
};

export default connect(mapStateToProps, null, null, { pure: false })(IdeaPageHeaderInfos);
