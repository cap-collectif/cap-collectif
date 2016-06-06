import React from 'react';
import { IntlMixin, FormattedDate } from 'react-intl';
import UserAvatar from '../User/UserAvatar';
import moment from 'moment';

const AnswerBody = React.createClass({
  propTypes: {
    answer: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const answer = this.props.answer;
    return (
      <div>
        {
          answer.author
            ? <div className="media media--user-thumbnail" style={{ marginBottom: '10px' }}>
                <UserAvatar className="pull-left" user={answer.author} style={{ paddingRight: '10px' }} />
                <div className="media-body">
                  <p className="media-heading media--macro__user  small" style={{ marginBottom: '0' }}>
                    {
                      answer.author._links.profile
                      ? <a href={answer.author._links.profile}>
                        { answer.author.username }
                      </a>
                      : <span>
                        { answer.author.username }
                      </span>
                    }
                  </p>
                  <span className="small excerpt">
                    <FormattedDate
                      value={moment(answer.created_at)}
                      day="numeric" month="long" year="numeric"
                    />
                  </span>
                </div>
              </div>
            : null
        }
        <div dangerouslySetInnerHTML={{ __html: answer.body }} />
      </div>
    );
  },

});

export default AnswerBody;
