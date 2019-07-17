// @flow
import * as React from 'react';
import { number } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import { Button, Tooltip, OverlayTrigger } from 'react-bootstrap';

import { UserAvatarDeprecated } from '../components/User/UserAvatarDeprecated';

import { author } from './mocks/users';

const votesMockGenerator = nb => new Array(nb).fill(author);

type Props = {
  votes: Array<Object>,
  max: number,
};

export const UserVoteList = (props: Props) => {
  const { votes, max } = props;

  return (
    <React.Fragment>
      {votes &&
        votes.slice(0, max).map((vote, index) => (
          <span className="mr-5">
            <OverlayTrigger
              key={index}
              placement="top"
              overlay={<Tooltip id={`opinion-vote-tooltip-${vote.id}`}>{vote.username}</Tooltip>}>
              <UserAvatarDeprecated user={vote} />
            </OverlayTrigger>
          </span>
        ))}
      {votes.length > 5 && (
        <span>
          <Button
            bsStyle="link"
            id="opinion-votes-show-all"
            onClick={() => {}}
            className="opinion__votes__more__link text-center">
            {`+${votes.length - max >= 100 ? '99' : votes.length - max}`}
          </Button>
        </span>
      )}
    </React.Fragment>
  );
};

UserVoteList.defaultProps = {
  max: 5,
};

storiesOf('UserVoteList', module)
  .add('default case', () => {
    const votes = votesMockGenerator(4);
    const max = number('Max display', 5);

    return <UserVoteList votes={votes} max={max} />;
  })
  .add('with 150 votes', () => {
    const votes = votesMockGenerator(150);
    const max = number('Max display', 5);

    return <UserVoteList votes={votes} max={max} />;
  });
