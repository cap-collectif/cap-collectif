import React from 'react';
import {IntlMixin} from 'react-intl';
import classNames from 'classnames';
import UserAvatar from '../../User/UserAvatar';

const ProposalPageAnswer = React.createClass({
  propTypes: {
    answer: React.PropTypes.object.isRequired,
    className: React.PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      className: '',
    };
  },

  render() {
    const answer = this.props.answer;
    const classes = {
      'bg-vip': answer.author && answer.author.vip,
      [this.props.className]: true,
    };
    return (
      <div className={classNames(classes)}>
        <div className="block">
          {
            answer.title
            ? <h2 className="h2">{answer.title}</h2>
            : null
          }
          {
            answer.author
              ? <div style={{marginBottom: '10px'}}>
                  <UserAvatar user={answer.author} style={{marginRight: '10px'}} />
                  <a href={answer.author._links.profile}>
                    { answer.author.username }
                  </a>
                </div>
              : null
          }
          <div dangerouslySetInnerHTML={{__html: answer.body}} />
        </div>
      </div>
    );
  },

});

export default ProposalPageAnswer;
