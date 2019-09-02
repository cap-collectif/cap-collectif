// @flow
import * as React from 'react';
import ReactDOM from 'react-dom';
import { graphql, createFragmentContainer } from 'react-relay';
import { reduxForm, Field, formValueSelector } from 'redux-form';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import classNames from 'classnames';
import autosize from 'autosize';
import { Row, Col, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import renderComponent from '../Form/Field';
import RegistrationButton from '../User/Registration/RegistrationButton';
import LoginButton from '../User/Login/LoginButton';
import UserAvatarDeprecated from '../User/UserAvatarDeprecated';
import AddCommentMutation from '../../mutations/AddCommentMutation';
import FluxDispatcher from '../../dispatchers/AppDispatcher';
import type { GlobalState, Dispatch } from '../../types';
import type { CommentForm_commentable } from '~relay/CommentForm_commentable.graphql';

type RelayProps = {| commentable: CommentForm_commentable |};

type OwnProps = {|
  isAnswer: boolean,
|};

type StateProps = {|
  form: string,
  comment: ?string,
  user: ?Object,
|};

type Props = {|
  ...OwnProps,
  ...RelayProps,
  ...StateProps,
  ...ReduxFormFormProps,
  intl: IntlShape,
|};

type State = {|
  expanded: boolean,
|};

type FormValues = {
  authorName: string,
  authorEmail: string,
  body: string,
};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { commentable, user, reset } = props;

  if (user) {
    delete values.authorName;
    delete values.authorEmail;
  }

  const input = {
    commentableId: commentable.id,
    ...values,
  };

  return AddCommentMutation.commit({ input, isAuthenticated: !!user })
    .then(response => {
      if (
        !response.addComment ||
        (response.addComment.userErrors && response.addComment.userErrors.length)
      ) {
        throw new Error('Mutation "addComment" failed');
      }
      reset();
      FluxDispatcher.dispatch({
        actionType: 'UPDATE_ALERT',
        alert: { bsStyle: 'success', content: 'comment.submit_success' },
      });
    })
    .catch(() => {
      FluxDispatcher.dispatch({
        actionType: 'UPDATE_ALERT',
        alert: { bsStyle: 'danger', content: 'comment.submit_error' },
      });
    });
};

const validate = ({ body, authorEmail, authorName }: FormValues) => {
  const errors = {};

  if (body && body.length < 2) {
    errors.body = 'comment.constraints.body';
  }

  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(authorEmail)) {
    errors.authorEmail = 'comment.constraints.author_email';
  }

  if (authorName && authorName.length < 2) {
    errors.authorName = 'comment.constraints.author_name';
  }

  return errors;
};

export const formName = 'CommentForm';
export class CommentForm extends React.Component<Props, State> {
  static defaultProps = {
    isAnswer: false,
  };

  state = {
    expanded: false,
  };

  componentDidUpdate() {
    autosize(ReactDOM.findDOMNode(this.refs.body));
  }

  onSubmit = (e: any) => {
    e.preventDefault();
    const resultSubmit = this.props.handleSubmit();
    if (resultSubmit) {
      resultSubmit.then(() => {
        this.setState({ expanded: false });
      });
    }
  };

  expand = () => {
    const { comment } = this.props;

    if (comment && comment.length === 0 && this.state.expanded === true) {
      this.setState({ expanded: false });
    }

    if (comment && comment.length >= 1 && this.state.expanded === false)
      this.setState({
        expanded: true,
      });
  };

  renderAnonymous() {
    const { user, submitting, pristine, invalid, intl } = this.props;

    if (!user) {
      return (
        <div>
          <Row>
            <Col sm={12} md={6}>
              <p>
                <FormattedMessage id="comment.with_my_account" />
              </p>
              <RegistrationButton />{' '}
              <LoginButton className="btn-darkest-gray navbar-btn btn--connection" />
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
                label={intl.formatMessage({ id: 'global.fullname' })}
                help={intl.formatMessage({ id: 'comment.public_name' })}
              />
              <Field
                type="email"
                name="authorEmail"
                id="authorEmail"
                component={renderComponent}
                label={intl.formatMessage({ id: 'global.hidden_email' })}
                help={intl.formatMessage({ id: 'comment.email_info' })}
              />
              <Button
                disabled={pristine || invalid || submitting}
                type="submit"
                bsStyle="primary"
                id="comment-submit"
                className="btn--comment">
                {submitting ? (
                  <FormattedMessage id="global.loading" />
                ) : (
                  <FormattedMessage id="comment.submit" />
                )}
              </Button>
            </Col>
          </Row>
        </div>
      );
    }
  }

  renderCommentButton() {
    const { user, submitting, pristine, invalid } = this.props;

    if (this.state.expanded) {
      if (user) {
        return (
          <Button
            ref="loggedInComment"
            disabled={pristine || invalid || submitting}
            bsStyle="primary"
            type="submit"
            className="btn--comment">
            {submitting ? (
              <FormattedMessage id="global.loading" />
            ) : (
              <FormattedMessage id="comment.submit" />
            )}
          </Button>
        );
      }

      return <div>{this.renderAnonymous()}</div>;
    }
  }

  render() {
    const { isAnswer, user, intl } = this.props;
    const classes = classNames({
      'comment-answer-form': isAnswer,
    });

    return (
      <div id="CommentForm" className={classes} style={{ marginTop: '10px', padding: '5px' }}>
        <UserAvatarDeprecated user={user} className="pull-left" />
        <div className="opinion__data" ref="commentBlock">
          <form onSubmit={this.onSubmit}>
            <Field
              type="textarea"
              name="body"
              component={renderComponent}
              aria-label={intl.formatMessage({ id: 'comment.write' })}
              rows="2"
              onChange={this.expand}
              placeholder="comment.write"
            />
            {this.renderCommentButton()}
          </form>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState, props) => ({
  comment: formValueSelector(formName + props.commentable.id)(state, 'body'),
  user: state.user.user,
  form: formName + props.commentable.id,
});

const container = injectIntl(CommentForm);

const form = connect<Props, GlobalState, _>(mapStateToProps)(
  reduxForm({
    validate,
    onSubmit,
  })(container),
);

export default createFragmentContainer(form, {
  commentable: graphql`
    fragment CommentForm_commentable on Commentable {
      id
    }
  `,
});
