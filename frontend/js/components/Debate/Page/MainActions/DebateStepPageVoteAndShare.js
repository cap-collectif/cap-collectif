// @flow
import React, { useState } from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage, useIntl, type IntlShape } from 'react-intl';
import { reduxForm, Field, formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import css from '@styled-system/css';
import { motion } from 'framer-motion';
import styled, { type StyledComponent } from 'styled-components';
import type { DebateStepPageVoteAndShare_debate } from '~relay/DebateStepPageVoteAndShare_debate.graphql';
import Flex from '~ui/Primitives/Layout/Flex';
import Button from '~ds/Button/Button';
import Card from '~ds/Card/Card';
import VoteView from '~/components/Ui/Vote/VoteView';
import AppBox from '~/components/Ui/Primitives/AppBox';
import DebateStepPageVote from './DebateStepPageVote';
import colors from '~/styles/modules/colors';
import typography from '~/styles/theme/typography';
import component from '~/components/Form/Field';
import type { GlobalState } from '~/types';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import AddDebateArgumentMutation from '~/mutations/AddDebateArgumentMutation';
import { formatConnectionPath } from '~/shared/utils/relay';

type Props = {|
  +debate: DebateStepPageVoteAndShare_debate,
  +isAuthenticated: boolean,
  +body: string,
|};

const Form: StyledComponent<{}, {}, HTMLFormElement> = styled.form`
  .form-group {
    margin: 0;
  }

  textarea {
    outline: none;
    background: none;
    border: none !important;
    resize: none;
    box-shadow: none !important;
    color: ${colors.gray[500]};
    font-size: ${typography.fontSizes[4]};
  }
`;

const addArgumentOnDebate = (
  debate: string,
  body: string,
  type?: 'FOR' | 'AGAINST',
  intl: IntlShape,
  onSuccess: () => void,
) => {
  if (!type) return;
  const connections = [
    formatConnectionPath(
      ['client', debate],
      'DebateStepPageArgumentsPagination_arguments',
      `(value:"${type}")`,
    ),
    formatConnectionPath(
      ['client', debate],
      'DebateStepPageAlternateArgumentsPagination_alternateArguments',
    ),
  ];
  return AddDebateArgumentMutation.commit({
    input: { debate, body, type },
    connections,
    edgeTypeName: 'DebateArgumentConnection',
  })
    .then(response => {
      if (response.createDebateArgument?.errorCode) {
        mutationErrorToast(intl);
      } else onSuccess();
    })
    .catch(() => {
      mutationErrorToast(intl);
    });
};

const formName = 'debate-argument-form';

export type VoteState = 'NONE' | 'VOTED' | 'ARGUMENTED';

export const DebateStepPageVoteAndShare = ({ debate, isAuthenticated, body }: Props) => {
  const intl = useIntl();
  const [voteState, setVoteState] = useState<VoteState>(
    debate.viewerHasVote ? (debate.viewerHasArgument ? 'ARGUMENTED' : 'VOTED') : 'NONE',
  );
  const [showArgumentForm, setShowArgumentForm] = useState(!debate.viewerHasArgument);

  const viewerVoteValue = debate.viewerVote?.type;

  return (
    <>
      {voteState === 'NONE' && (
        <DebateStepPageVote
          debateId={debate.id}
          isAuthenticated={isAuthenticated}
          onSuccess={setVoteState}
        />
      )}
      {voteState !== 'NONE' && (
        <>
          <AppBox width={570}>
            <VoteView
              positivePercentage={(debate.yesVotes.totalCount / debate.votes.totalCount) * 100}
            />
          </AppBox>
          <motion.div
            style={{ width: '100%' }}
            transition={{ delay: 0.75, duration: 0.5 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>
            <Flex alignItems="center" justifyContent="center" mb={8}>
              <span role="img" aria-label="vote" css={{ fontSize: 36, marginRight: 8 }}>
                {voteState === 'ARGUMENTED' ? '🎉' : '🗳️'}
              </span>
              <FormattedMessage
                id={
                  voteState === 'ARGUMENTED' ? 'thanks-for-debate-richer' : 'thanks-for-your-vote'
                }
              />
              <Button
                css={css({
                  color: 'gray.700',
                  '&:hover': {
                    color: 'gray.700',
                  },
                })}
                ml={2}
                variant="link"
                variantSize="small"
                onClick={() => setVoteState('NONE')}>
                <FormattedMessage
                  id={viewerVoteValue === 'FOR' ? 'edit.vote.for' : 'edit.vote.against'}
                />
              </Button>
            </Flex>

            {showArgumentForm && (
              <Card
                borderRadius="8px"
                width="100%"
                bg="white"
                boxShadow="0px 10px 50px 0px rgba(0, 0, 0, 0.15)"
                p={6}
                pb={body?.length > 0 ? 6 : 2}>
                <Form id={formName}>
                  <Field
                    name="body"
                    component={component}
                    type="textarea"
                    id="body"
                    minLength="1"
                    autoComplete="off"
                    placeholder={intl.formatMessage({
                      id: viewerVoteValue === 'FOR' ? 'why-are-you-for' : 'why-are-you-against',
                    })}
                  />
                  {body?.length > 0 && (
                    <Flex justifyContent="flex-end">
                      <Button
                        onClick={() => setShowArgumentForm(false)}
                        type="button"
                        mr={7}
                        variant="link"
                        variantColor="primary"
                        variantSize="small">
                        <FormattedMessage id="global.cancel" />
                      </Button>
                      <Button
                        onClick={() =>
                          addArgumentOnDebate(debate.id, body, viewerVoteValue, intl, () => {
                            setShowArgumentForm(false);
                            setVoteState('ARGUMENTED');
                          })
                        }
                        type="button"
                        variant="primary"
                        variantColor="primary"
                        variantSize="big">
                        <FormattedMessage id="argument.publish.mine" />
                      </Button>
                    </Flex>
                  )}
                </Form>
              </Card>
            )}
          </motion.div>
        </>
      )}
    </>
  );
};

const selector = formValueSelector(formName);

const mapStateToProps = (state: GlobalState) => ({
  initialValues: {
    body: '',
  },
  body: selector(state, 'body'),
});

const form = reduxForm({
  form: formName,
})(DebateStepPageVoteAndShare);

export default createFragmentContainer(connect(mapStateToProps)(form), {
  debate: graphql`
    fragment DebateStepPageVoteAndShare_debate on Debate
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      viewerHasArgument @include(if: $isAuthenticated)
      viewerHasVote @include(if: $isAuthenticated)
      viewerVote @include(if: $isAuthenticated) {
        type
      }
      yesVotes: votes(type: FOR) {
        totalCount
      }
      votes {
        totalCount
      }
    }
  `,
});
