// @flow
import * as React from 'react';
import { FormattedDate } from 'react-intl';
import moment from 'moment';
import UserAvatar from '../User/UserAvatar';
import UserLink from '../User/UserLink';

type Props = {
  answer: Object,
};

export class AnswerBody extends React.Component<Props> {
  render() {
    const answer = this.props.answer;
    return (
      <div>
        {answer.author ? (
          <div className="media media--user-thumbnail" style={{ marginBottom: '10px' }}>
            <UserAvatar
              className="pull-left"
              user={answer.author}
              style={{ paddingRight: '10px' }}
            />
            <div className="media-body">
              <p className="media-heading media--macro__user" style={{ marginBottom: '0' }}>
                <UserLink user={answer.author} />
              </p>
              <span className="excerpt">
                <FormattedDate
                  value={moment(answer.createdAt)}
                  day="numeric"
                  month="long"
                  year="numeric"
                />
              </span>
            </div>
          </div>
        ) : null}
        <div dangerouslySetInnerHTML={{ __html: answer.body }} />
      </div>
    );
  }
}

export default AnswerBody;
