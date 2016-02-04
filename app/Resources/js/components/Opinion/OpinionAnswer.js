import React from 'react';
import { IntlMixin } from 'react-intl';
import classNames from 'classnames';
import UserAvatar from '../User/UserAvatar';

const OpinionAnswer = React.createClass({
  propTypes: {
    answer: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const answer = this.props.answer;
    const classes = classNames({
      'opinion__answer': true,
      'bg-vip': answer.author && answer.author.vip,
    });
    return (
      <div className={classes} id="answer">
        {
          answer.title
          ? <p className="h4" style={{ marginTop: '0' }}>{answer.title}</p>
          : null
        }
        {
          answer.author
          ? <div style={{ marginBottom: '10px' }}>
              <UserAvatar user={answer.author} style={{ marginRight: '10px' }} />
              <a href={answer.author._links.profile}>
                { answer.author.username }
              </a>
            </div>
          : null
        }
        <div dangerouslySetInnerHTML={{ __html: answer.body }} />
      </div>
    );
  },

});

export default OpinionAnswer;
