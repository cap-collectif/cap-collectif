/**
 * @flow
 */
import React, {Component} from 'react';
import {injectIntl, FormattedMessage} from 'react-intl';
import {Table} from 'react-bootstrap';
import {connect} from 'react-redux';
import {reduxForm, Field} from 'redux-form';
import component from '../../Form/Field';
import type { NotificationForm_configuration } from "./NotificationForm_configuration";
import type { GlobalState } from '../../../types'

type FormValues = Object;
type DefaultProps = void;
type Props = {
  notificationsConfiguration: NotificationForm_configuration
};
type State = void;

const formName = 'user-notifications';

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  console.log(props, values);
};

export class NotificationsForm extends Component<Props, State> {
  static defaultProps: DefaultProps;

  render() {
    const {notificationsConfiguration} = this.props;
    const {onProposalCommentMail} = notificationsConfiguration;
    console.log(this.props);
    return (
      <form onSubmit={handleSubmit} className="form-horizontal">
        <Table className="notifications-table" striped>
          <thead>
          <tr>
            <th>
              <FormattedMessage id="profile.account.notifications.title"/>
            </th>
            <th>
              <FormattedMessage id="profile.account.notifications.email"/>
            </th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>
              <FormattedMessage id="profile.account.notifications.proposal_comment"/>
            </td>
            <td>
              <Field name="onProposalCommentMail"
                     component={component}
                     type="checkbox"
                     id="proposal-comment-mail"
                     checked={onProposalCommentMail}
              
              />
            </td>
          </tr>
          </tbody>
        </Table>
      </form>
    );
  }
}

const form = reduxForm({
  onSubmit,
  form: formName,
})(NotificationsForm);

const mapStateToProps = (state: GlobalState) => ({
  notificationsConfiguration: state.user.user ? state.user.user.notificationsConfiguration : null
});

export default connect(mapStateToProps)(injectIntl(form));
