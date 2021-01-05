// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage, useIntl, type IntlShape } from 'react-intl';
import { Field } from 'redux-form';
import css from '@styled-system/css';
import { motion } from 'framer-motion';
import styled, { type StyledComponent } from 'styled-components';
import type { DebateStepPageVoteForm_debate } from '~relay/DebateStepPageVoteForm_debate.graphql';
import Flex from '~ui/Primitives/Layout/Flex';
import Button from '~ds/Button/Button';
import Card from '~ds/Card/Card';
import colors from '~/styles/modules/colors';
import typography from '~/styles/theme/typography';
import component from '~/components/Form/Field';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import AddDebateArgumentMutation from '~/mutations/AddDebateArgumentMutation';
import { formatConnectionPath } from '~/shared/utils/relay';
import { type VoteState, formName } from './DebateStepPageVoteAndShare';

type Props = {|
  +debate: DebateStepPageVoteForm_debate,
  +body: string,
  +voteState: VoteState,
  +setVoteState: VoteState => void,
  +showArgumentForm: boolean,
  +setShowArgumentForm: boolean => void,
|};

export const Form: StyledComponent<{}, {}, HTMLFormElement> = styled.form`
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

export const addArgumentOnDebate = (
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

export const DebateStepPageVoteForm = ({
  debate,
  body,
  voteState,
  setVoteState,
  showArgumentForm,
  setShowArgumentForm,
}: Props) => {
  const intl = useIntl();

  const viewerVoteValue = debate.viewerVote?.type;

  return (
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
          id={voteState === 'ARGUMENTED' ? 'thanks-for-debate-richer' : 'thanks-for-your-vote'}
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
  );
};

export default createFragmentContainer(DebateStepPageVoteForm, {
  debate: graphql`
    fragment DebateStepPageVoteForm_debate on Debate
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      viewerVote @include(if: $isAuthenticated) {
        type
      }
    }
  `,
});
