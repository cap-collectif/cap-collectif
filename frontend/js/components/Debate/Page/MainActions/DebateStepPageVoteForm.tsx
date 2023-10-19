// @ts-nocheck
import { $PropertyType } from 'utility-types'
import * as React from 'react'
import type { RelayFragmentContainer } from 'react-relay'
import { graphql, createFragmentContainer } from 'react-relay'
import type { IntlShape } from 'react-intl'
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl'
import { Field, formValueSelector, reduxForm } from 'redux-form'
import { connect } from 'react-redux'
import copy from 'copy-to-clipboard'
import { m as motion } from 'framer-motion'
import { useAnalytics } from 'use-analytics'
import styled from 'styled-components'
import { useActor } from '@xstate/react'
import { useDisclosure } from '@liinkiing/react-hooks'
import { Flex, Button, Icon, Card, Tooltip, Text, Popover, ButtonGroup, toast } from '@cap-collectif/ui'
import colors from '~/styles/modules/colors'
import ResetCss from '~/utils/ResetCss'
import type { DebateStepPageVoteForm_debate } from '~relay/DebateStepPageVoteForm_debate.graphql'
import typography from '~/styles/theme/typography'
import component from '~/components/Form/Field'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import AddDebateArgumentMutation from '~/mutations/AddDebateArgumentMutation'
import { formatConnectionPath } from '~/shared/utils/relay'
import useScript from '~/utils/hooks/useScript'
import MobilePublishArgumentModal from '~/components/Debate/Page/Modals/MobilePublishArgumentModal'
import RemoveDebateVoteMutation from '~/mutations/RemoveDebateVoteMutation'
import type { Dispatch, GlobalState } from '~/types'
import ModalDeleteVoteMobile from '~/components/Debate/Page/Modals/ModalDeleteVoteMobile'
import RemoveDebateAnonymousVoteMutation from '~/mutations/RemoveDebateAnonymousVoteMutation'
import CookieMonster from '~/CookieMonster'
import type { VoteAction, VoteState } from './DebateStepPageStateMachine'
import { MachineContext } from './DebateStepPageStateMachine'
import ModalPublishArgumentAnonymous from '~/components/Debate/Page/Modals/ModalPublishArgumentAnonymous'
export const formName = 'debate-argument-form'
type Viewer = {
  readonly id: string
  readonly username: string
  readonly isEmailConfirmed: boolean
}
type FormValues = {
  readonly body: string
}
type OwnProps = {
  readonly showArgumentForm: boolean
  readonly isMobile?: boolean
  readonly setShowArgumentForm: (arg0: boolean) => void
  readonly isAbsolute?: boolean
  readonly url?: string
  readonly viewerIsConfirmed: boolean
  readonly widgetLocation: string | null | undefined
  readonly intl: IntlShape
  readonly send: (arg0: VoteAction) => void
}
type RelayProps = {
  readonly debate: DebateStepPageVoteForm_debate
}
type BeforeConnectProps = OwnProps & RelayProps
type StateProps = {
  readonly initialValues: FormValues
  readonly dispatch: Dispatch
  readonly body: string
  readonly organizationName: string
  readonly viewer: Viewer | null
}
type AfterConnectProps = BeforeConnectProps & StateProps
type Props = AfterConnectProps & ReduxFormFormProps
export const Form = styled.form<{
  disabled: boolean
}>`
  cursor: ${props => (props.disabled ? 'not-allowed' : 'auto')};

  .form-group {
    margin: 0;
  }

  textarea {
    height: 4.5rem;
    outline: none;
    background: none;
    border: none !important;
    resize: none;
    box-shadow: none !important;
    color: ${colors.gray[500]};
    font-size: ${typography.fontSizes[4]};

    &::placeholder {
      font-size: 1.2857142857rem;
      color: ${colors.gray[500]};
      font-weight: normal;
    }
  }
`
export const addArgumentOnDebate = (
  debate: string,
  body: string,
  type?: 'FOR' | 'AGAINST',
  widgetLocation: string | null,
  intl: IntlShape,
  onSuccess: () => void,
  onError: () => void,
  author: {
    id: $PropertyType<Viewer, 'id'>
    username: $PropertyType<Viewer, 'username'>
    isEmailConfirmed: $PropertyType<Viewer, 'isEmailConfirmed'>
  },
): void | Promise<void> => {
  if (!type) return
  const connections = [
    formatConnectionPath(['client', debate], 'DebateStepPageArgumentsPagination_arguments', `(value:"${type}")`),
  ]
  // For optimistic response
  onSuccess()
  return AddDebateArgumentMutation.commit(
    {
      input: {
        debate,
        body,
        type,
        widgetOriginURI: widgetLocation,
      },
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
        mutationErrorToast(intl)
        onError()
      }
    })
    .catch(() => {
      mutationErrorToast(intl)
      onError()
    })
}

const deleteAnonymousVoteFromViewer = (
  debateId: string,
  send: (state: VoteAction) => void,
  setShowArgumentForm: (arg0: boolean) => void,
  intl: IntlShape,
) => {
  const hash = CookieMonster.getHashedDebateAnonymousVoteCookie(debateId)
  const argumentHash = CookieMonster.getHashedDebateAnonymousArgumentCookie(debateId)
  if (!hash) return
  return RemoveDebateAnonymousVoteMutation.commit({
    input: {
      debateId,
      hash,
      argumentHash,
    },
    debateId,
  })
    .then(response => {
      if (response.removeDebateAnonymousVote?.errorCode) {
        mutationErrorToast(intl)
      } else {
        toast({
          variant: 'success',
          content: intl.formatHTMLMessage({
            id: 'vote.delete_success',
          }),
        })
        CookieMonster.removeDebateAnonymousVoteCookie(debateId)
        if (argumentHash) CookieMonster.removeDebateAnonymousArgumentCookie(debateId)
        send('DELETE_VOTE')
        setShowArgumentForm(true)
      }
    })
    .catch(() => {
      mutationErrorToast(intl)
    })
}

const deleteVoteFromViewer = (
  debateId: string,
  type: 'FOR' | 'AGAINST',
  viewerHasArgument: boolean,
  send: (state: VoteAction) => void,
  setShowArgumentForm: (arg0: boolean) => void,
  intl: IntlShape,
) => {
  const connections = [
    formatConnectionPath(['client', debateId], 'DebateStepPageArgumentsPagination_arguments', `(value:"${type}")`),
  ]
  return RemoveDebateVoteMutation.commit({
    input: {
      debateId,
    },
    connections,
  })
    .then(response => {
      if (response.removeDebateVote?.errorCode) {
        mutationErrorToast(intl)
      } else {
        toast({
          variant: 'success',
          content: intl.formatHTMLMessage({
            id: viewerHasArgument ? 'argument.vote.remove_success' : 'vote.delete_success',
          }),
        })
        send('DELETE_VOTE')
        setShowArgumentForm(true)
      }
    })
    .catch(() => {
      mutationErrorToast(intl)
    })
}

const bandMessage = () => ({
  voted: 'thanks-for-your-vote',
  voted_anonymous: 'thanks-for-your-vote',
  argumented: 'thanks-for-debate-richer',
  voted_not_confirmed: 'publish.vote.validate.account',
  argumented_not_confirmed: 'publish.argument.validate.account',
  argumented_anonymous: 'thanks-for-debate-richer',
  none: null,
  none_not_confirmed: null,
  none_anonymous: null,
  result: null,
  idle: null,
})

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { body } = values
  const { debate, intl, setShowArgumentForm, widgetLocation, send } = props
  return addArgumentOnDebate(
    debate.id,
    body,
    debate.viewerVote?.type,
    widgetLocation,
    intl,
    () => {
      setShowArgumentForm(false)
      send('ARGUMENT')
    },
    () => {
      setShowArgumentForm(true)
      send('VOTE')
    },
    {
      id: props.viewer?.id || '',
      username: props.viewer?.username || '',
      isEmailConfirmed: props.viewer?.isEmailConfirmed || false,
    },
  )
}

export const DebateStepPageVoteForm = ({
  debate,
  body,
  showArgumentForm,
  setShowArgumentForm,
  isAbsolute,
  url,
  isMobile,
  viewerIsConfirmed,
  handleSubmit,
  organizationName,
  intl,
  widgetLocation,
}: Props): JSX.Element => {
  useScript('https://platform.twitter.com/widgets.js')
  const { track } = useAnalytics()
  const { onOpen, onClose, isOpen } = useDisclosure()
  const machine = React.useContext(MachineContext)
  const [current, send] = useActor<
    // @ts-ignore
    {
      value: VoteState
    },
    VoteAction
  >(machine)
  const { value } = current
  const viewerVoteValue =
    value === 'voted_anonymous' || value === 'argumented_anonymous'
      ? CookieMonster.getDebateAnonymousVoteCookie(debate.id)?.type ?? 'AGAINST'
      : debate.viewerVote?.type ?? 'AGAINST'
  const title = viewerVoteValue === 'FOR' ? 'why-are-you-for' : 'why-are-you-against'
  return (
    <motion.div
      style={{
        width: '100%',
      }}
      transition={{
        delay: isAbsolute ? 0 : 0.75,
        duration: isAbsolute ? 0 : 0.5,
      }}
      initial={{
        opacity: isMobile ? 1 : 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
    >
      <Flex direction={['column', 'row']} align="center" justify="center" fontWeight={isAbsolute ? [600, 500] : [500]}>
        <>
          {isMobile && (
            <>
              {!isAbsolute &&
                (debate.viewerHasArgument ? (
                  <ModalDeleteVoteMobile debate={debate} setShowArgumentForm={setShowArgumentForm} />
                ) : (
                  <Button
                    ml={2}
                    variant="link"
                    variantColor="hierarchy"
                    onClick={() => {
                      if (value !== 'voted_anonymous' && value !== 'argumented_anonymous') {
                        deleteVoteFromViewer(
                          debate.id,
                          viewerVoteValue,
                          debate?.viewerHasArgument || false,
                          send,
                          setShowArgumentForm,
                          intl,
                        )
                      } else {
                        deleteAnonymousVoteFromViewer(debate.id, send, setShowArgumentForm, intl)
                      }
                    }}
                  >
                    <FormattedMessage id={viewerVoteValue === 'FOR' ? 'delete.vote.for' : 'delete.vote.against'} />
                  </Button>
                ))}
              <Text textAlign="center">
                <span
                  role="img"
                  aria-label="vote"
                  css={{
                    fontSize: 20,
                    marginRight: 8,
                  }}
                >
                  {value.includes('argumented') ? '🎉' : '🗳️'}
                </span>
                {bandMessage()[value] && (
                  <FormattedHTMLMessage
                    id={bandMessage()[value]}
                    values={
                      value === 'voted_anonymous'
                        ? {
                            instance: organizationName,
                          }
                        : undefined
                    }
                  />
                )}
              </Text>
            </>
          )}

          {!isMobile && (
            <>
              <span
                role="img"
                aria-label="vote"
                css={{
                  fontSize: 36,
                  marginRight: 8,
                }}
              >
                {value.includes('argumented') ? '🎉' : '🗳️'}
              </span>

              {bandMessage()[value] && (
                <FormattedHTMLMessage
                  id={bandMessage()[value]}
                  values={
                    value === 'voted_anonymous'
                      ? {
                          instance: organizationName,
                        }
                      : undefined
                  }
                />
              )}

              {value !== 'voted_anonymous' && debate.viewerHasArgument && (
                <Popover
                  placement="right"
                  disclosure={
                    <Button ml={2} variant="link" variantColor="hierarchy">
                      <FormattedMessage id={viewerVoteValue === 'FOR' ? 'delete.vote.for' : 'delete.vote.against'} />
                    </Button>
                  }
                >
                  {({ closePopover }) => (
                    <React.Fragment>
                      <ResetCss>
                        <Popover.Header closeButton={false}>
                          {intl.formatMessage({
                            id: 'vote-delete-confirmation',
                          })}
                        </Popover.Header>
                      </ResetCss>
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
                            variantSize="small"
                          >
                            {intl.formatMessage({
                              id: 'cancel',
                            })}
                          </Button>
                          <Button
                            variant="primary"
                            variantColor="danger"
                            variantSize="small"
                            onClick={() => {
                              track('debate_vote_delete', {
                                type: viewerVoteValue,
                                url: debate.url,
                              })
                              deleteVoteFromViewer(
                                debate.id,
                                viewerVoteValue,
                                debate?.viewerHasArgument || false,
                                send,
                                setShowArgumentForm,
                                intl,
                              )
                            }}
                          >
                            {intl.formatMessage({
                              id: 'delete-vote',
                            })}
                          </Button>
                        </ButtonGroup>
                      </Popover.Footer>
                    </React.Fragment>
                  )}
                </Popover>
              )}
              {(value === 'voted_anonymous' || !debate.viewerHasArgument) && (
                <Button
                  ml={2}
                  variant="link"
                  variantColor="hierarchy"
                  onClick={() => {
                    if (value === 'voted_anonymous' || value === 'argumented_anonymous') {
                      deleteAnonymousVoteFromViewer(debate.id, send, setShowArgumentForm, intl)
                    } else {
                      track('debate_vote_delete', {
                        type: viewerVoteValue,
                        url: debate.url,
                      })
                      deleteVoteFromViewer(
                        debate.id,
                        viewerVoteValue,
                        debate?.viewerHasArgument || false,
                        send,
                        setShowArgumentForm,
                        intl,
                      )
                    }
                  }}
                >
                  <FormattedMessage id={viewerVoteValue === 'FOR' ? 'delete.vote.for' : 'delete.vote.against'} />
                </Button>
              )}
            </>
          )}
        </>
      </Flex>

      {value === 'argumented' && (
        <Flex mt={3} flexDirection="row" spacing={2} justify="center">
          {url && url !== '' && (
            <iframe
              title="facebook share button"
              src={`https://www.facebook.com/plugins/share_button.php?href=${url}&layout=button_count&size=small&width=91&height=20&appId`}
              width="91"
              height="20"
              style={{
                border: 'none',
                overflow: 'hidden',
              }}
              scrolling="no"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
          <a
            href="https://twitter.com/share?ref_src=twsrc%5Etfw"
            className="twitter-share-button"
            data-show-count="false"
          >
            Tweet
          </a>

          <Tooltip
            label={intl.formatMessage({
              id: 'copied-link',
            })}
          >
            <Button
              variantColor="hierarchy"
              color="white"
              height={5}
              p="4px 8px"
              fontSize={11}
              onClick={() => {
                track('debate_share_btn_click', {
                  from: 'url',
                  url: debate.url,
                })
                copy(url)
              }}
            >
              <Icon name="HYPERLINK" mr="1" size="sm" />
              <FormattedMessage id="global.link" />
            </Button>
          </Tooltip>
        </Flex>
      )}

      {showArgumentForm && !isMobile && !widgetLocation && (
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
          pb={body?.length > 0 ? 6 : 2}
        >
          <Form id={formName} onSubmit={handleSubmit} disabled={false}>
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
                <Button onClick={() => setShowArgumentForm(false)} mr={7} variant="link" variantColor="primary">
                  <FormattedMessage id="global.cancel" />
                </Button>
                {value === 'voted_anonymous' ? (
                  <ModalPublishArgumentAnonymous
                    formName={formName}
                    initialState="INFO"
                    message="global.validate"
                    title={title}
                    argumentBody={body}
                    viewerVoteValue={viewerVoteValue}
                    debate={debate.id}
                  />
                ) : (
                  <Button
                    onClick={() => {
                      track('debate_argument_publish', {
                        url: debate.url,
                      })
                    }}
                    type="submit"
                    variant="primary"
                    variantColor="primary"
                    variantSize="big"
                  >
                    <FormattedMessage id={viewerIsConfirmed ? 'argument.publish.mine' : 'global.validate'} />
                  </Button>
                )}
              </Flex>
            )}
          </Form>
        </Card>
      )}

      {showArgumentForm && (isMobile || widgetLocation) && (
        <>
          <MobilePublishArgumentModal
            debateUrl={debate.url}
            title={intl.formatMessage({
              id: title,
            })}
            show={showArgumentForm && value !== 'voted_anonymous' && isOpen}
            onClose={onClose}
            onSubmit={handleSubmit}
          />
          {value === 'voted_anonymous' ? (
            <ModalPublishArgumentAnonymous
              formName={formName}
              initialState="FORM"
              message="publish-argument"
              isMobile={isMobile}
              title={title}
              viewerVoteValue={viewerVoteValue}
              debate={debate.id}
            />
          ) : (
            <Button mt={3} onClick={onOpen} justifyContent="center" variant="primary" variantSize="big" width="100%">
              {intl.formatMessage({
                id: 'publish-argument',
              })}
            </Button>
          )}
        </>
      )}
    </motion.div>
  )
}
const selector = formValueSelector(formName)

const mapStateToProps = (state: GlobalState) => ({
  initialValues: {
    body: '',
  },
  viewer: state.user.user
    ? {
        id: state.user.user.id,
        username: state.user.user.username,
        isEmailConfirmed: state.user.user.isEmailConfirmed,
      }
    : null,
  body: selector(state, 'body'),
  organizationName: state.default.parameters['global.site.organization_name'],
})

const form = reduxForm({
  form: formName,
  onSubmit,
  destroyOnUnmount: false,
})(DebateStepPageVoteForm)
const container = connect<AfterConnectProps, BeforeConnectProps, _, _, _, _>(mapStateToProps)(
  form,
) as React.AbstractComponent<BeforeConnectProps>
export default createFragmentContainer(container, {
  debate: graphql`
    fragment DebateStepPageVoteForm_debate on Debate
    @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, isMobile: { type: "Boolean!" }) {
      id
      url
      viewerVote @include(if: $isAuthenticated) {
        type
      }
      viewerHasArgument @include(if: $isAuthenticated)
      ...ModalDeleteVoteMobile_debate @arguments(isAuthenticated: $isAuthenticated) @include(if: $isMobile)
    }
  `,
}) as RelayFragmentContainer<typeof container>
