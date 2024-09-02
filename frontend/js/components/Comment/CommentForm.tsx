import * as React from 'react'
import ReactDOM from 'react-dom'
import { createFragmentContainer, graphql } from 'react-relay'
import { Field, formValueSelector, reduxForm } from 'redux-form'
import type { IntlShape } from 'react-intl'
import { FormattedMessage, injectIntl } from 'react-intl'
import classNames from 'classnames'
import autosize from 'autosize'
import { Button, Col, Row } from 'react-bootstrap'
import { connect } from 'react-redux'
import renderComponent from '../Form/Field'
import { openRegistrationModal } from '@shared/register/RegistrationButton'
import { Button as DSButton } from '@cap-collectif/ui'
import { UserAvatarLegacy } from '../User/UserAvatarLegacy'
import AddCommentMutation from '../../mutations/AddCommentMutation'
import type { Dispatch, GlobalState } from '../../types'
import type { CommentForm_commentable } from '~relay/CommentForm_commentable.graphql'
import { toast } from '~ds/Toast'
import { baseUrl } from '~/config'
import { loginWithOpenID } from '~/redux/modules/default'
import { openLoginModal } from '@shared/login/LoginButton'

type RelayProps = {
  readonly commentable: CommentForm_commentable
}
type OwnProps = {
  readonly isAnswer: boolean
}
type BeforeConnectProps = RelayProps & OwnProps
type StateProps = {
  readonly form: string
  readonly comment: string | null | undefined
  readonly user: Record<string, any> | null | undefined
  readonly dispatch: Dispatch
  readonly isModerationEnabled: boolean | null | undefined
  readonly oauth2SwitchUser: boolean | null | undefined
  readonly byPassLoginModal: boolean | null | undefined
}
type AfterConnectProps = RelayProps & OwnProps & StateProps
type Props = AfterConnectProps &
  ReduxFormFormProps & {
    readonly intl: IntlShape
  }
type State = {
  expanded: boolean
}
type FormValues = {
  authorName?: string
  authorEmail?: string
  body: string
}

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { commentable, user, reset, isModerationEnabled, intl } = props

  if (user) {
    delete values.authorName
    delete values.authorEmail
  }

  const input = {
    commentableId: commentable.id,
    ...values,
  }
  return AddCommentMutation.commit({
    input,
    isAuthenticated: !!user,
  })
    .then(response => {
      if (!response.addComment || (response.addComment.userErrors && response.addComment.userErrors.length)) {
        throw new Error('Mutation "addComment" failed')
      }

      const comment = response.addComment.commentEdge?.node
      const isAuthorAnonymous = !comment?.author?.id && comment?.authorEmail
      reset()

      if (isAuthorAnonymous && isModerationEnabled) {
        toast({ content: intl.formatMessage({ id: 'confirm-email-address' }), variant: 'success' })
        return
      }
      toast({ content: intl.formatMessage({ id: 'comment.submit_success' }), variant: 'success' })
    })
    .catch(() => {
      toast({ content: intl.formatMessage({ id: 'comment.submit_error' }), variant: 'danger' })
    })
}

const validate = ({ body, authorEmail, authorName }: FormValues) => {
  const errors: any = {}

  if (body && body.length < 2) {
    errors.body = 'comment.constraints.body'
  }

  if (authorEmail && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(authorEmail)) {
    errors.authorEmail = 'comment.constraints.author_email'
  }

  if (authorName && authorName.length < 2) {
    errors.authorName = 'comment.constraints.author_name'
  }

  return errors
}

export const formName = 'CommentForm'
export class CommentForm extends React.Component<Props, State> {
  static defaultProps = {
    isAnswer: false,
  }
  state = {
    expanded: false,
  }

  componentDidUpdate() {
    autosize(ReactDOM.findDOMNode(this.refs.body))
  }

  onSubmit = (e: any) => {
    const { handleSubmit } = this.props
    e.preventDefault()
    const resultSubmit = handleSubmit()

    if (resultSubmit) {
      resultSubmit.then(() => {
        this.setState({
          expanded: false,
        })
      })
    }
  }
  expand = () => {
    const { comment } = this.props
    const { expanded } = this.state

    if (comment && comment.length === 0 && expanded === true) {
      this.setState({
        expanded: false,
      })
    }

    if (comment && comment.length >= 1 && expanded === false)
      this.setState({
        expanded: true,
      })
  }

  renderAnonymous() {
    const { user, submitting, pristine, invalid, intl, oauth2SwitchUser, byPassLoginModal } = this.props

    let redirectUrl: string = baseUrl

    if (loginWithOpenID && byPassLoginModal) {
      const redirectUri = oauth2SwitchUser
        ? `${baseUrl}/sso/switch-user?_destination=${window && window.location.href}`
        : `${window && window.location.href}`
      redirectUrl = `/login/openid?_destination=${redirectUri}`
    }

    if (!user) {
      return (
        <div>
          <Row>
            <Col sm={12} md={6}>
              <p>
                <FormattedMessage id="comment.with_my_account" />
              </p>
              <DSButton
                variant="secondary"
                justifyContent="center"
                onClick={() => {
                  dispatchEvent(new Event(openRegistrationModal))
                }}
              >
                {intl.formatMessage({ id: 'global.registration' })}
              </DSButton>
              <DSButton
                id="login-button"
                variant="primary"
                display="block"
                mt={1}
                aria-label={intl.formatMessage({
                  id: 'open.connection_modal',
                })}
                onClick={() => {
                  if (loginWithOpenID && byPassLoginModal) {
                    window.location.href = redirectUrl
                  } else {
                    dispatchEvent(new Event(openLoginModal))
                  }
                }}
              >
                {intl.formatMessage({ id: 'global.login' })}
              </DSButton>
              <h5>
                <FormattedMessage id="comment.why_create_account" />
              </h5>
              <ul className="excerpt small">
                <li>
                  <FormattedMessage id="comment.create_account_reason_1" />
                </li>
                <li>
                  <FormattedMessage id="comment.create_account_reason_2" />
                </li>
                <li>
                  <FormattedMessage id="comment.create_account_reason_3" />
                </li>
              </ul>
            </Col>
            <Col sm={12} md={6}>
              <p>
                <FormattedMessage id="comment.without_account" />
              </p>
              <Field
                type="text"
                name="authorName"
                id="authorName"
                component={renderComponent}
                label={intl.formatMessage({
                  id: 'global.fullname',
                })}
                help={intl.formatMessage({
                  id: 'comment.public_name',
                })}
              />
              <Field
                type="email"
                name="authorEmail"
                id="authorEmail"
                component={renderComponent}
                label={intl.formatMessage({
                  id: 'global.hidden_email',
                })}
                help={intl.formatMessage({
                  id: 'comment.email_info',
                })}
              />
              <Button
                disabled={pristine || invalid || submitting}
                type="submit"
                bsStyle="primary"
                id="comment-submit"
                className="btn--comment"
              >
                {submitting ? <FormattedMessage id="global.loading" /> : <FormattedMessage id="comment.submit" />}
              </Button>
            </Col>
          </Row>
        </div>
      )
    }
  }

  renderCommentButton() {
    const { user, submitting, pristine, invalid } = this.props
    const { expanded } = this.state

    if (expanded) {
      if (user) {
        return (
          <Button // eslint-disable-next-line react/no-string-refs
            ref="loggedInComment"
            disabled={pristine || invalid || submitting}
            bsStyle="primary"
            type="submit"
            className="btn--comment"
          >
            {submitting ? <FormattedMessage id="global.loading" /> : <FormattedMessage id="comment.submit" />}
          </Button>
        )
      }

      return <div>{this.renderAnonymous()}</div>
    }
  }

  render() {
    const { isAnswer, user, intl } = this.props
    const classes = classNames({
      'comment-answer-form': isAnswer,
    })
    return (
      <div
        id="CommentForm"
        className={classes}
        style={{
          marginTop: '10px',
          padding: '5px',
        }}
      >
        <UserAvatarLegacy user={user} className="pull-left" />
        {/**  eslint-disable-next-line react/no-string-refs */}
        <div className="opinion__data" ref="commentBlock">
          <form onSubmit={this.onSubmit}>
            <Field
              type="textarea"
              name="body"
              component={renderComponent}
              aria-label={intl.formatMessage({
                id: 'comment.write',
              })}
              rows="2"
              onChange={this.expand}
              placeholder="comment.write"
            />
            {this.renderCommentButton()}
          </form>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state: GlobalState, props: BeforeConnectProps) => {
  const comment: string | null | undefined = formValueSelector(formName + props.commentable.id)(state, 'body')
  const byPassLoginModal = state.default.features.sso_by_pass_auth
  const oauth2SwitchUser = state.default.features.oauth2_switch_user
  return {
    comment,
    oauth2SwitchUser,
    byPassLoginModal,
    user: state.user.user,
    form: formName + props.commentable.id,
    isModerationEnabled: state.default.features.moderation_comment,
    loginWithOpenId: loginWithOpenID(state.default.ssoList),
  }
}

const form = injectIntl(
  // @ts-ignore
  connect<AfterConnectProps, BeforeConnectProps, _, _, _, _>(mapStateToProps)(
    reduxForm({
      validate,
      onSubmit,
    })(CommentForm),
  ),
)
export default createFragmentContainer(form, {
  commentable: graphql`
    fragment CommentForm_commentable on Commentable {
      id
    }
  `,
})
