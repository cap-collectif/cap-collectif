import React, { PropTypes } from 'react';
import { IntlMixin, FormattedMessage, FormattedDate } from 'react-intl';
import moment from 'moment';
import { connect } from 'react-redux';
import UserLink from '../../User/UserLink';

export const IdeaPageHeaderInfos = React.createClass({
  propTypes: {
    idea: PropTypes.object.isRequired,
    features: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const {
      idea,
      features,
    } = this.props;

    const createdDate = (
      <FormattedDate
        value={moment(idea.createdAt)}
        day="numeric" month="long" year="numeric" hour="numeric" minute="numeric"
      />
    );
    const updatedDate = (
      <FormattedDate
        value={moment(idea.updatedAt)}
        day="numeric" month="long" year="numeric" hour="numeric" minute="numeric"
      />
    );
    const themeLink = idea.theme && features.themes
      ? (
        <a href={idea.theme._links.show}>
          {idea.theme.title}
        </a>
      )
      : null
    ;

    return (
      <p className="media--aligned excerpt">
        {
          themeLink
            ? <FormattedMessage
              message={this.getIntlMessage('idea.header.infos')}
              user={<UserLink user={idea.author} />}
              created={createdDate}
              theme={themeLink}
              />
          : <FormattedMessage
            message={this.getIntlMessage('idea.header.infos_no_theme')}
            user={<UserLink user={idea.author} />}
            created={createdDate}
            />
        }
        {
          (moment(idea.updatedAt).diff(idea.createdAt, 'seconds') > 1)
            ? <span>
              {' • '}
            <FormattedMessage
              message={this.getIntlMessage('global.edited_on')}
              updated={updatedDate}
            />
            </span>
            : null
        }
        {
          idea.commentable
          ? <span>
              {' | '}
              <a href="#comments" id="idea-comments-nb">
                <FormattedMessage
                  num={idea.commentsCount}
                  message={this.getIntlMessage('idea.header.comments')}
                />
              </a>
          </span>
          : null
        }
        <span>
            {' | '}
            <a href="#votes" id="idea-votes-nb">
              <FormattedMessage
                num={idea.votesCount}
                message={this.getIntlMessage('idea.header.votes')}
              />
            </a>
        </span>
        {
          idea.trashed
          ? <span className="label label-default" style={{ marginLeft: '5px' }}>
            {this.getIntlMessage('idea.header.trashed')}
          </span>
          : null
        }
      </p>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    features: state.default.features,
  };
};

export default connect(mapStateToProps, null, null, { pure: false })(IdeaPageHeaderInfos);
