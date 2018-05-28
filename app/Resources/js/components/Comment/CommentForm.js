import * as React from 'react';
import ReactDOM from 'react-dom';
import { reduxForm, Field, formValueSelector } from 'redux-form';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import classNames from 'classnames';
import autosize from 'autosize';
import { Row, Col, Button } from 'react-bootstrap';
import { connect, type MapStateToProps } from 'react-redux';
import renderComponent from '../Form/Field';
import RegistrationButton from '../User/Registration/RegistrationButton';
import LoginButton from '../User/Login/LoginButton';
import UserAvatar from '../User/UserAvatar';
import type { GlobalState, Dispatch } from '../../types';
import CommentActions from '../../actions/CommentActions';

type Props = {
  isAnswer?: boolean,
  comment: ?string,
  object: string,
  uri: string,
  user?: Object,
  intl: IntlShape,
  submitting: boolean,
  pristine: boolean,
  invalid: boolean,
  handleSubmit?: Function,
};

type State = {
  expanded: boolean,
};

const onSubmit = (values: Object, dispatch: Dispatch, props: Props) => {
  const { object, uri, user } = props;

  if (user) {
    delete values.authorName;
    delete values.authorEmail;
  }

  return CommentActions.create(uri, object, values);
};

const validate = ({ body, authorEmail, authorName }) => {
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
    user: null,
    comment: 0,
  };

  state = {
    expanded: false,
  };

  componentDidUpdate() {
    autosize(ReactDOM.findDOMNode(this.refs.body));
  }

  expand() {
    const { comment } = this.props;

    if (comment && comment.length <= 1 && this.state.expanded === true) {
      this.setState({ expanded: false });
    }

    if (comment && comment.length >= 2 && this.state.expanded === false)
      this.setState({ expanded: true });
  }

  renderAnonymous() {
    const { user, submitting, pristine, invalid } = this.props;

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
                component={renderComponent}
                label={<FormattedMessage id="global.fullname" />}
                help={<FormattedMessage id="comment.public_name" />}
              />
              <Field
                type="email"
                name="authorEmail"
                component={renderComponent}
                label={<FormattedMessage id="global.hidden_email" />}
                help={<FormattedMessage id="comment.email_info" />}
              />
              <Button
                disabled={pristine || invalid || submitting}
                type="submit"
                bsStyle="primary"
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
    const { isAnswer, user, intl, handleSubmit } = this.props;
    const classes = classNames({
      'comment-answer-form': isAnswer,
    });

    return (
      <div className={classes} style={{ padding: '5px' }}>
        <UserAvatar user={user} className="pull-left" />
        <div className="opinion__data" ref="commentBlock">
          <form onSubmit={handleSubmit}>
            <Field
              type="textarea"
              name="body"
              component={renderComponent}
              aria-label={intl.formatMessage({ id: 'comment.write' })}
              rows="2"
              onChange={this.expand()}
              placeholder="comment.write"
            />
            {this.renderCommentButton()}
          </form>
        </div>
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState) => ({
  comment: formValueSelector(formName)(state, 'body'),
  user: state.user.user,
});

const container = injectIntl(CommentForm);

export default connect(mapStateToProps)(
  reduxForm({
    validate,
    onSubmit,
    form: formName,
  })(container),
);
