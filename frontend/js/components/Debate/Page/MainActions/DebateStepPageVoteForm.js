// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage, FormattedHTMLMessage, useIntl, type IntlShape } from 'react-intl';
import { Field } from 'redux-form';
import copy from 'copy-to-clipboard';
import css from '@styled-system/css';
import { m as motion } from 'framer-motion';
import styled, { type StyledComponent } from 'styled-components';
import { useDisclosure } from '@liinkiing/react-hooks';
import type { DebateStepPageVoteForm_debate } from '~relay/DebateStepPageVoteForm_debate.graphql';
import Flex from '~ui/Primitives/Layout/Flex';
import Button from '~ds/Button/Button';
import Icon from '~ds/Icon/Icon';
import Card from '~ds/Card/Card';
import colors from '~/styles/modules/colors';
import Tooltip from '~ds/Tooltip/Tooltip';
import typography from '~/styles/theme/typography';
import component from '~/components/Form/Field';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import AddDebateArgumentMutation from '~/mutations/AddDebateArgumentMutation';
import { formatConnectionPath } from '~/shared/utils/relay';
import { type VoteState, formName } from './DebateStepPageVoteAndShare';
import useScript from '~/utils/hooks/useScript';
import MobilePublishArgumentModal from '~/components/Debate/Page/Modals/MobilePublishArgumentModal';
import Text from '~ui/Primitives/Text';

type Props = {|
  +debate: DebateStepPageVoteForm_debate,
  +body: string,
  +voteState: VoteState,
  +setVoteState: VoteState => void,
  +showArgumentForm: boolean,
  +isMobile?: boolean,
  +setShowArgumentForm: boolean => void,
  +isAbsolute?: boolean,
  +url?: string,
  +viewerIsConfirmed: boolean,
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

    &::placeholder {
      color: ${colors.gray[500]};
      font-weight: normal;
    }
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

const bandMessage = {
  VOTED: 'thanks-for-your-vote',
  ARGUMENTED: 'thanks-for-debate-richer',
  NOT_CONFIRMED: 'publish.vote.validate.account',
  NOT_CONFIRMED_ARGUMENTED: 'publish.argument.validate.account',
  NONE: '',
  RESULT: '',
};

export const DebateStepPageVoteForm = ({
  debate,
  body,
  voteState,
  setVoteState,
  showArgumentForm,
  setShowArgumentForm,
  isAbsolute,
  url,
  isMobile,
  viewerIsConfirmed,
}: Props) => {
  useScript('https://platform.twitter.com/widgets.js');
  const { onOpen, onClose, isOpen } = useDisclosure();
  const intl = useIntl();

  const viewerVoteValue = debate.viewerVote?.type;

  const publishArgument = () =>
    addArgumentOnDebate(debate.id, body, viewerVoteValue, intl, () => {
      setShowArgumentForm(false);
      setVoteState('ARGUMENTED');
    });

  const title = intl.formatMessage({
    id: viewerVoteValue === 'FOR' ? 'why-are-you-for' : 'why-are-you-against',
  });
  return (
    <motion.div
      style={{ width: '100%' }}
      transition={{ delay: isAbsolute ? 0 : 0.75, duration: isAbsolute ? 0 : 0.5 }}
      initial={{ opacity: isMobile ? 1 : 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}>
      <Flex
        direction={['column', 'row']}
        alignItems="center"
        justifyContent="center"
        fontWeight={isAbsolute ? [600, 500] : [500]}>
        <>
          {isMobile && (
            <>
              {!isAbsolute && (
                <Button
                  css={css({
                    color: 'gray.700',
                    '&:hover': {
                      color: 'gray.700',
                    },
                  })}
                  ml={[0, 2]}
                  mb={[3, 0]}
                  variant="link"
                  onClick={() => setVoteState('NONE')}>
                  <FormattedMessage
                    id={viewerVoteValue === 'FOR' ? 'edit.vote.for' : 'edit.vote.against'}
                  />
                </Button>
              )}
              <Text textAlign="center">
                <span role="img" aria-label="vote" css={{ fontSize: 20, marginRight: 8 }}>
                  {voteState === 'ARGUMENTED' || voteState === 'NOT_CONFIRMED_ARGUMENTED'
                    ? '🎉'
                    : '🗳️'}
                </span>
                {voteState !== 'NONE' && voteState !== 'RESULT' && (
                  <FormattedHTMLMessage id={bandMessage[voteState]} />
                )}
              </Text>
            </>
          )}
          {!isMobile && (
            <>
              <span role="img" aria-label="vote" css={{ fontSize: 36, marginRight: 8 }}>
                {voteState === 'ARGUMENTED' || voteState === 'NOT_CONFIRMED_ARGUMENTED'
                  ? '🎉'
                  : '🗳️'}
              </span>
              {voteState !== 'NONE' && voteState !== 'RESULT' && (
                <FormattedHTMLMessage id={bandMessage[voteState]} />
              )}
              <Button
                css={css({
                  color: 'gray.700',
                  '&:hover': {
                    color: 'gray.700',
                  },
                })}
                ml={2}
                variant="link"
                onClick={() => setVoteState('NONE')}>
                <FormattedMessage
                  id={viewerVoteValue === 'FOR' ? 'edit.vote.for' : 'edit.vote.against'}
                />
              </Button>
            </>
          )}
        </>
      </Flex>
      {voteState === 'ARGUMENTED' && (
        <Flex mt={3} flexDirection="row" spacing={2} justify="center">
          {url && url !== '' && (
            <iframe
              title="facebook share button"
              src={`https://www.facebook.com/plugins/share_button.php?href=${url}&layout=button&size=small&width=81&height=20&appId`}
              width="81"
              height="20"
              style={{ border: 'none', overflow: 'hidden' }}
              scrolling="no"
              frameBorder="0"
              allowFullScreen="true"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            />
          )}
          <a
            href="https://twitter.com/share?ref_src=twsrc%5Etfw"
            className="twitter-share-button"
            data-show-count="false">
            Tweet
          </a>

          <Tooltip label={intl.formatMessage({ id: 'copied-link' })} trigger={['click']}>
            <Button
              backgroundColor="gray.500"
              color="white"
              height={5}
              p="4px 8px"
              fontSize={11}
              onClick={() => copy(url)}>
              <Icon name="HYPERLINK" mr="1" size="sm" />
              <FormattedMessage id="global.link" />
            </Button>
          </Tooltip>
        </Flex>
      )}

      {showArgumentForm && !isMobile && (
        <Card
          borderRadius="8px"
          width="100%"
          bg="white"
          boxShadow="0px 10px 50px 0px rgba(0, 0, 0, 0.15)"
          p={6}
          mt={8}
          pb={body?.length > 0 ? 6 : 2}>
          <Form id={formName}>
            <Field
              name="body"
              component={component}
              type="textarea"
              id="body"
              minLength="1"
              autoComplete="off"
              placeholder={title}
            />
            {body?.length > 0 && (
              <Flex justifyContent="flex-end">
                <Button
                  onClick={() => setShowArgumentForm(false)}
                  type="button"
                  mr={7}
                  variant="link"
                  variantColor="primary">
                  <FormattedMessage id="global.cancel" />
                </Button>
                <Button
                  onClick={publishArgument}
                  type="button"
                  variant="primary"
                  variantColor="primary"
                  variantSize="big">
                  <FormattedMessage
                    id={viewerIsConfirmed ? 'argument.publish.mine' : 'global.validate'}
                  />
                </Button>
              </Flex>
            )}
          </Form>
        </Card>
      )}
      {showArgumentForm && isMobile && (
        <>
          <MobilePublishArgumentModal
            title={title}
            show={showArgumentForm && isOpen}
            onClose={onClose}
            onSubmit={publishArgument}
          />
          <Button
            mt={3}
            onClick={onOpen}
            justifyContent="center"
            variant="primary"
            variantSize="big"
            width="100%">
            {intl.formatMessage({ id: 'publish-argument' })}
          </Button>
        </>
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
