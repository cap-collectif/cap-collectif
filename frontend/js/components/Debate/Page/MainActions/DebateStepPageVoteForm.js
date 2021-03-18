// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage, FormattedHTMLMessage, type IntlShape } from 'react-intl';
import { Field, formValueSelector, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import copy from 'copy-to-clipboard';
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
import { type VoteState } from './DebateStepPageVoteAndShare';
import useScript from '~/utils/hooks/useScript';
import MobilePublishArgumentModal from '~/components/Debate/Page/Modals/MobilePublishArgumentModal';
import Text from '~ui/Primitives/Text';
import ConditionalWrapper from '~/components/Utils/ConditionalWrapper';
import LoginOverlay from '~/components/Utils/LoginOverlay';
import { useDebateStepPage } from '~/components/Debate/Page/DebateStepPage.context';
import Popover from '~ds/Popover';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import RemoveDebateVoteMutation from '~/mutations/RemoveDebateVoteMutation';
import { toast } from '~ds/Toast';
import type { Dispatch, GlobalState } from '~/types';
import ModalDeleteVoteMobile from '~/components/Debate/Page/Modals/ModalDeleteVoteMobile';
import RemoveDebateAnonymousVoteMutation from '~/mutations/RemoveDebateAnonymousVoteMutation';
import CookieMonster from '~/CookieMonster';

export const formName = 'debate-argument-form';

type Viewer = {|
  id: string,
  username: string,
  isEmailConfirmed: boolean,
|};

type Props = {|
  ...ReduxFormFormProps,
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
  +organizationName: string,
  +widgetLocation: ?string,
  +intl: IntlShape,
  +viewer: Viewer,
|};

type FormValues = {|
  +body: string,
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
  widgetLocation: ?string,
  intl: IntlShape,
  onSuccess: () => void,
  onError: () => void,
  author: {
    id: $PropertyType<Viewer, 'id'>,
    username: $PropertyType<Viewer, 'username'>,
    isEmailConfirmed: $PropertyType<Viewer, 'isEmailConfirmed'>,
  },
) => {
  if (!type) return;
  const connections = [
    formatConnectionPath(
      ['client', debate],
      'DebateStepPageArgumentsPagination_arguments',
      `(value:"${type}")`,
    ),
  ];

  // For optimistic response
  onSuccess();

  return AddDebateArgumentMutation.commit(
    {
      input: { debate, body, type, widgetOriginURI: widgetLocation },
      connections,
      edgeTypeName: 'DebateArgumentEdge',
    },
    {
      id: author.id,
      username: author.username,
      isEmailConfirmed: author.isEmailConfirmed,
    },
  )
    .then(response => {
      if (response.createDebateArgument?.errorCode) {
        mutationErrorToast(intl);
        onError();
      }
    })
    .catch(() => {
      mutationErrorToast(intl);
      onError();
    });
};

const deleteAnonymousVoteFromViewer = (
  debateId: string,
  setVoteState: VoteState => void,
  setShowArgumentForm: boolean => void,
  intl: IntlShape,
) => {
  const hash = CookieMonster.getHashedDebateAnonymousVoteCookie(debateId);
  if (!hash) return;
  return RemoveDebateAnonymousVoteMutation.commit({
    input: {
      debateId,
      hash,
    },
  })
    .then(response => {
      if (response.removeDebateAnonymousVote?.errorCode) {
        mutationErrorToast(intl);
      } else {
        toast({
          variant: 'success',
          content: intl.formatHTMLMessage({ id: 'vote.delete_success' }),
        });
        CookieMonster.removeDebateAnonymousVoteCookie(debateId);
        setVoteState('NONE');
        setShowArgumentForm(true);
      }
    })
    .catch(() => {
      mutationErrorToast(intl);
    });
};

const deleteVoteFromViewer = (
  debateId: string,
  type: 'FOR' | 'AGAINST',
  viewerHasArgument: boolean,
  setVoteState: VoteState => void,
  setShowArgumentForm: boolean => void,
  intl: IntlShape,
) => {
  const connections = [
    formatConnectionPath(
      ['client', debateId],
      'DebateStepPageArgumentsPagination_arguments',
      `(value:"${type}")`,
    ),
  ];

  return RemoveDebateVoteMutation.commit({
    input: {
      debateId,
    },
    connections,
  })
    .then(response => {
      if (response.removeDebateVote?.errorCode) {
        mutationErrorToast(intl);
      } else {
        toast({
          variant: 'success',
          content: intl.formatHTMLMessage({
            id: viewerHasArgument ? 'argument.vote.remove_success' : 'vote.delete_success',
          }),
        });
        setVoteState('NONE');
        setShowArgumentForm(true);
      }
    })
    .catch(() => {
      mutationErrorToast(intl);
    });
};

const bandMessage = (fromWidget: boolean) => ({
  VOTED: 'thanks-for-your-vote',
  VOTED_ANONYMOUS: fromWidget ? 'thanks-vote-argument-on-instance' : 'thanks-for-your-vote',
  ARGUMENTED: 'thanks-for-debate-richer',
  NOT_CONFIRMED: 'publish.vote.validate.account',
  NOT_CONFIRMED_ARGUMENTED: 'publish.argument.validate.account',
  NONE: null,
  RESULT: null,
});

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { body } = values;
  const {
    debate,
    intl,
    setShowArgumentForm,
    setVoteState,
    viewerIsConfirmed,
    widgetLocation,
  } = props;

  return addArgumentOnDebate(
    debate.id,
    body,
    debate.viewerVote?.type,
    widgetLocation,
    intl,
    () => {
      setShowArgumentForm(false);
      setVoteState(viewerIsConfirmed ? 'ARGUMENTED' : 'NOT_CONFIRMED_ARGUMENTED');
    },
    () => {
      setShowArgumentForm(true);
      setVoteState('VOTED');
    },
    {
      id: props.viewer?.id,
      username: props.viewer?.username,
      isEmailConfirmed: props.viewer?.isEmailConfirmed,
    },
  );
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
  handleSubmit,
  organizationName,
  intl,
}: Props) => {
  useScript('https://platform.twitter.com/widgets.js');
  const { onOpen, onClose, isOpen } = useDisclosure();
  const { widget } = useDebateStepPage();
  const viewerVoteValue =
    voteState === 'VOTED_ANONYMOUS'
      ? CookieMonster.getDebateAnonymousVoteCookie(debate.id)?.type ?? 'AGAINST'
      : debate.viewerVote?.type ?? 'AGAINST';

  const title = viewerVoteValue === 'FOR' ? 'why-are-you-for' : 'why-are-you-against';

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
              {!isAbsolute &&
                (debate.viewerHasArgument ? (
                  <ModalDeleteVoteMobile
                    debate={debate}
                    setShowArgumentForm={setShowArgumentForm}
                    setVoteState={setVoteState}
                  />
                ) : (
                  <Button
                    color="gray.700"
                    ml={2}
                    variant="link"
                    onClick={() => {
                      if (voteState !== 'VOTED_ANONYMOUS') {
                        deleteVoteFromViewer(
                          debate.id,
                          viewerVoteValue,
                          debate?.viewerHasArgument || false,
                          setVoteState,
                          setShowArgumentForm,
                          intl,
                        );
                      } else {
                        deleteAnonymousVoteFromViewer(
                          debate.id,
                          setVoteState,
                          setShowArgumentForm,
                          intl,
                        );
                      }
                    }}>
                    <FormattedMessage
                      id={viewerVoteValue === 'FOR' ? 'delete.vote.for' : 'delete.vote.against'}
                    />
                  </Button>
                ))}
              <Text textAlign="center">
                <span role="img" aria-label="vote" css={{ fontSize: 20, marginRight: 8 }}>
                  {voteState === 'ARGUMENTED' || voteState === 'NOT_CONFIRMED_ARGUMENTED'
                    ? '🎉'
                    : '🗳️'}
                </span>
                {bandMessage(widget.isSource)[voteState] && (
                  <FormattedHTMLMessage
                    id={bandMessage(widget.isSource)[voteState]}
                    values={
                      voteState === 'VOTED_ANONYMOUS' ? { instance: organizationName } : undefined
                    }
                  />
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

              {bandMessage(widget.isSource)[voteState] && (
                <FormattedHTMLMessage
                  id={bandMessage(widget.isSource)[voteState]}
                  values={
                    voteState === 'VOTED_ANONYMOUS' ? { instance: organizationName } : undefined
                  }
                />
              )}

              {voteState !== 'VOTED_ANONYMOUS' && debate.viewerHasArgument && (
                <Popover placement="right" trigger={['click']}>
                  <Popover.Trigger>
                    <Button color="gray.700" ml={2} variant="link">
                      <FormattedMessage
                        id={viewerVoteValue === 'FOR' ? 'delete.vote.for' : 'delete.vote.against'}
                      />
                    </Button>
                  </Popover.Trigger>
                  <Popover.Content>
                    {({ closePopover }) => (
                      <React.Fragment>
                        <Popover.Header>
                          {intl.formatMessage({ id: 'vote-delete-confirmation' })}
                        </Popover.Header>
                        <Popover.Body>
                          <Text>
                            {intl.formatMessage({
                              id: 'delete-argument-associate-to-vote',
                            })}
                          </Text>
                        </Popover.Body>
                        <Popover.Footer>
                          <ButtonGroup>
                            <Button
                              onClick={closePopover}
                              variant="secondary"
                              variantColor="hierarchy"
                              variantSize="small">
                              {intl.formatMessage({ id: 'cancel' })}
                            </Button>
                            <Button
                              variant="primary"
                              variantColor="danger"
                              variantSize="small"
                              onClick={() =>
                                deleteVoteFromViewer(
                                  debate.id,
                                  viewerVoteValue,
                                  debate?.viewerHasArgument || false,
                                  setVoteState,
                                  setShowArgumentForm,
                                  intl,
                                )
                              }>
                              {intl.formatMessage({ id: 'delete-vote' })}
                            </Button>
                          </ButtonGroup>
                        </Popover.Footer>
                      </React.Fragment>
                    )}
                  </Popover.Content>
                </Popover>
              )}
              {(voteState === 'VOTED_ANONYMOUS' || !debate.viewerHasArgument) && (
                <Button
                  color="gray.700"
                  ml={2}
                  variant="link"
                  onClick={() => {
                    if (voteState === 'VOTED_ANONYMOUS') {
                      deleteAnonymousVoteFromViewer(
                        debate.id,
                        setVoteState,
                        setShowArgumentForm,
                        intl,
                      );
                    } else {
                      deleteVoteFromViewer(
                        debate.id,
                        viewerVoteValue,
                        debate?.viewerHasArgument || false,
                        setVoteState,
                        setShowArgumentForm,
                        intl,
                      );
                    }
                  }}>
                  <FormattedMessage
                    id={viewerVoteValue === 'FOR' ? 'delete.vote.for' : 'delete.vote.against'}
                  />
                </Button>
              )}
            </>
          )}
        </>
      </Flex>

      {voteState === 'ARGUMENTED' && (
        <Flex mt={3} flexDirection="row" spacing={2} justify="center">
          {url && url !== '' && (
            <iframe
              title="facebook share button"
              src={`https://www.facebook.com/plugins/share_button.php?href=${url}&layout=button_count&size=small&width=91&height=20&appId`}
              width="91"
              height="20"
              style={{ border: 'none', overflow: 'hidden' }}
              scrolling="no"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
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

      {((showArgumentForm && !isMobile && !widget.isSource) ||
        (showArgumentForm && !isMobile && widget.isSource && widget.authEnabled)) && (
        <ConditionalWrapper
          when={voteState === 'VOTED_ANONYMOUS'}
          wrapper={children => <LoginOverlay placement="bottom">{children}</LoginOverlay>}>
          <Card
            borderRadius="8px"
            width="100%"
            bg="white"
            boxShadow="0px 10px 50px 0px rgba(0, 0, 0, 0.15)"
            p={6}
            mt={8}
            css={{
              '& form textarea[disabled]': {
                backgroundColor: 'transparent !important',
              },
            }}
            pb={body?.length > 0 ? 6 : 2}>
            <Form id={formName} onSubmit={handleSubmit}>
              <Field
                name="body"
                disabled={voteState === 'VOTED_ANONYMOUS'}
                component={component}
                type="textarea"
                id="body"
                minLength="1"
                autoComplete="off"
                placeholder={title}
              />
              {voteState !== 'VOTED_ANONYMOUS' && body?.length > 0 && (
                <Flex justifyContent="flex-end">
                  <Button
                    onClick={() => setShowArgumentForm(false)}
                    mr={7}
                    variant="link"
                    variantColor="primary">
                    <FormattedMessage id="global.cancel" />
                  </Button>
                  <Button type="submit" variant="primary" variantColor="primary" variantSize="big">
                    <FormattedMessage
                      id={viewerIsConfirmed ? 'argument.publish.mine' : 'global.validate'}
                    />
                  </Button>
                </Flex>
              )}
            </Form>
          </Card>
        </ConditionalWrapper>
      )}

      {showArgumentForm && !isMobile && widget.isSource && !widget.authEnabled && (
        <Flex direction="row" justify="center">
          <Button
            onClick={() => {
              window.open(url, '_blank');
            }}
            variant="primary"
            variantColor="primary"
            variantSize="big"
            rightIcon="PREVIEW">
            <FormattedMessage id="continue-on-instance" values={{ instance: organizationName }} />
          </Button>
        </Flex>
      )}

      {showArgumentForm && isMobile && (
        <>
          <MobilePublishArgumentModal
            title={intl.formatMessage({ id: title })}
            show={showArgumentForm && voteState !== 'VOTED_ANONYMOUS' && isOpen}
            onClose={onClose}
            onSubmit={handleSubmit}
          />
          <ConditionalWrapper
            when={voteState === 'VOTED_ANONYMOUS'}
            wrapper={children => (
              <LoginOverlay placement={isAbsolute ? 'top' : 'bottom'}>{children}</LoginOverlay>
            )}>
            <Button
              mt={3}
              onClick={onOpen}
              justifyContent="center"
              variant="primary"
              variantSize="big"
              width="100%">
              {intl.formatMessage({ id: 'publish-argument' })}
            </Button>
          </ConditionalWrapper>
        </>
      )}
    </motion.div>
  );
};

const selector = formValueSelector(formName);

const mapStateToProps = (state: GlobalState) => ({
  initialValues: {
    body: '',
  },
  viewer: state.user.user,
  body: selector(state, 'body'),
  organizationName: state.default.parameters['global.site.organization_name'],
});

const form = reduxForm({
  form: formName,
  onSubmit,
})(DebateStepPageVoteForm);

const DebateStepPageVoteFormConnected = connect<any, any, _, _, _, _>(mapStateToProps)(form);

export default createFragmentContainer(DebateStepPageVoteFormConnected, {
  debate: graphql`
    fragment DebateStepPageVoteForm_debate on Debate
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      viewerVote @include(if: $isAuthenticated) {
        type
      }
      viewerHasArgument @include(if: $isAuthenticated)
      ...ModalDeleteVoteMobile_debate @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
});
