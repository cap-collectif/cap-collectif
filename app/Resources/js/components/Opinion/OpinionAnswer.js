// @flow
import React from 'react';
import classNames from 'classnames';
import { graphql, createFragmentContainer } from 'react-relay';
import AnswerBody from '../Answer/AnswerBody';
import type { OpinionAnswer_opinion } from '~relay/OpinionAnswer_opinion.graphql';

type Props = {
  opinion: OpinionAnswer_opinion,
};

class OpinionAnswer extends React.Component<Props> {
  render() {
    const { answer } = this.props.opinion;
    if (!answer) {
      return null;
    }
    const classes = classNames({
      opinion__answer: true,
      'bg-vip': answer.author && answer.author.vip,
    });
    return (
      <div className={classes} id="answer">
        {answer.title ? (
          <p className="h4" style={{ marginTop: '0' }}>
            {answer.title}
          </p>
        ) : null}
        <AnswerBody answer={answer} />
      </div>
    );
  }
}

export default createFragmentContainer(OpinionAnswer, {
  opinion: graphql`
    fragment OpinionAnswer_opinion on OpinionOrVersion {
      ... on Opinion {
        answer {
          author {
            vip
          }
          title
          ...AnswerBody_answer
        }
      }
      ... on Version {
        answer {
          author {
            vip
          }
          title
          ...AnswerBody_answer
        }
      }
    }
  `,
});
