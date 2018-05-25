import * as React from 'react';
import ReactDOM from 'react-dom';
import { reduxForm, Field, formValueSelector } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import classNames from 'classnames';
import autosize from 'autosize';
import { Row, Col, Button } from 'react-bootstrap';
import { connect, type MapStateToProps } from 'react-redux';
import renderComponent from '../Form/Field';
import RegistrationButton from '../User/Registration/RegistrationButton';
import LoginButton from '../User/Login/LoginButton';
import UserAvatar from '../User/UserAvatar';
import type { GlobalState } from '../../types';
// import { intlMock } from '../../mocks';
import CommentActions from '../../actions/CommentActions';


type Props = {
  isAnswer?: boolean,
  focus?: boolean,
  comment: ?string,
  user?: Object,
  // intl: intlMock,
  intl: Object,
  submitting: boolean,
  handleSubmit?: Function,
}

type State = {
  expanded: boolean,
}

const onSubmit = (values, dispatch, props) => {
  const { user } = props;

  // const { comment, object, uri } = this.props;
  //   data.parent = comment.id;
  // return CommentActions.create(uri, object, data);
};

const validate = ({ body, authorEmail, authorName }: Object) => {
  const errors = {};
  if (body.length <= 1) {
    errors.body = 'comment.constraints.body';
  }

  if (authorEmail.length === 0) {
    errors.authorEmail = 'comment.constraints.author_email';
  }

  if (authorName.length <= 2) {
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

  // check https://github.com/cap-collectif/platform/pull/4583/files?utf8=%E2%9C%93&diff=split

  state = {
    expanded: false,
  };

  // componentDidMount() {
  //   const { focus, user } = this.props;
  //   if (focus) {
  //     ReactDOM.findDOMNode(this.refs.body).focus();
  //   }
  //   this.updateConstraints(!user);
  // }
  //
  // componentWillReceiveProps(nextProps) {
  //   const { user } = this.props;
  //   if (nextProps.focus) {
  //     ReactDOM.findDOMNode(this.refs.body).focus();
  //     this.setState({ expanded: true });
  //   }
  //   if (nextProps.user !== user) {
  //     this.updateConstraints(!nextProps.user);
  //   }
  // }
  //
  componentDidUpdate() {
    autosize(ReactDOM.findDOMNode(this.refs.body));
  }
  //
  // getFormClasses() {
  //   const { isAnswer } = this.props;
  //   return classNames({
  //     'comment-answer-form': isAnswer,
  //   });
  // }

  // expand(newState) {
  //   const { comment } = this.props;
  //
  //   if (!newState) {
  //     const $block = $(ReactDOM.findDOMNode(this.refs.commentBlock));
  //     if (
  //       // eslint-disable-next-line no-undef
  //       event.relatedTarget &&
  //       // eslint-disable-next-line no-undef
  //       ($(event.relatedTarget).is($block) ||
  //         // eslint-disable-next-line no-undef
  //         $block.has($(event.relatedTarget)).length)
  //     ) {
  //       return; // clicked on an element inside comment block
  //     }
  //     if (comment && comment.length === 0) {
  //       this.setState({ expanded: false });
  //       return;
  //     }
  //   }
  //   this.setState({ expanded: newState });
  // }

  expand () {
    const { comment } = this.props;

    if (comment && comment.length <= 1 && this.state.expanded === true) {
      this.setState({ expanded: false });
    }

    if(comment && comment.length >= 2 && this.state.expanded === false )
    this.setState({ expanded: true });
  }

  // create() {
  //   const { comment, user } = this.props;
  //   this.setState({ submitted: true }, () => {
  //     if (!this.isValid()) {
  //       return;
  //     }
  //
  //     this.setState({ isSubmitting: true });
  //     const data = this.state.form;
  //     if (user) {
  //       delete data.authorName;
  //       delete data.authorEmail;
  //     }
  //
  //     comment(data)
  //       .then(() => {
  //         this.setState(this.getInitialState());
  //         autosize.destroy(ReactDOM.findDOMNode(this.refs.body));
  //       })
  //       .catch(() => {
  //         this.setState({ isSubmitting: false, submitted: false });
  //       });
  //   });
  // }

  renderAnonymous() {
    const { user, submitting } = this.props;
    if (!user) {
      return (
        <div>
          <Row>
            <Col sm={12} md={6}>
              <p><FormattedMessage id="comment.with_my_account" /></p>
              <RegistrationButton />{' '}
              <LoginButton className="btn-darkest-gray navbar-btn btn--connection" />
              <h5><FormattedMessage id="comment.why_create_account" /></h5>
              <ul className="excerpt small">
                <li><FormattedMessage id="comment.create_account_reason_1" /></li>
                <li><FormattedMessage id="comment.create_account_reason_2" /></li>
                <li><FormattedMessage id="comment.create_account_reason_3" /></li>
              </ul>
            </Col>
            <Col sm={12} md={6}>
              <p><FormattedMessage id="comment.without_account" /></p>
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
                // ref="anonymousComment"
                disabled={submitting}
                onClick={submitting ? null : this.create}
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
    const { user, submitting } = this.props;

    if (this.state.expanded) {
      if (user) {
        return (
          <Button
            ref="loggedInComment"
            disabled={submitting}
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
          <form form onSubmit={handleSubmit}>
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
