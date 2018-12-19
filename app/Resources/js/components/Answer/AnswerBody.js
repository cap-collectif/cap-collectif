// @flow
import * as React from 'react';
import { FormattedDate } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import moment from 'moment';
import UserAvatar from '../User/UserAvatar';
import UserLink from '../User/UserLink';
import type { AnswerBody_answer } from './__generated__/AnswerBody_answer.graphql';
import WYSIWYGRender from '../Form/WYSIWYGRender';

type Props = {
  answer: AnswerBody_answer,
};

export class AnswerBody extends React.Component<Props> {
  render() {
    const { answer } = this.props;
    const author = answer.authors ? answer.authors[0] : answer.author;
    return (
      <div>
        {author ? (
          <div className="media media--user-thumbnail" style={{ marginBottom: '10px' }}>
            <UserAvatar className="pull-left" user={author} style={{ paddingRight: '10px' }} />
            <div className="media-body">
              <p className="media-heading media--macro__user" style={{ marginBottom: '0' }}>
                <UserLink user={author} />
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
        <WYSIWYGRender value={answer.body} />
      </div>
    );
  }
}

export default createFragmentContainer(AnswerBody, {
  answer: graphql`
    fragment AnswerBody_answer on AnswerOrPost {
      ... on Answer {
        body
        createdAt
        author {
          displayName
          media {
            url
          }
          url
        }
      }
      ... on Post {
        title
        createdAt
        body
        authors {
          id
          vip
          displayName
        }
      }
    }
  `,
});
