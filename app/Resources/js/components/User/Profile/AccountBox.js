// @flow
import React, { PropTypes } from 'react';
import { Panel, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { IntlMixin } from 'react-intl';

export const AccountBox = React.createClass({
  propTypes: {
    user: PropTypes.object.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { user, isSubmitting } = this.props;

    const header =
         this.getIntlMessage('phone.confirm.phone')
    ;

    const footer = (
      <Button
        id="edit-account-profile-button"
        onClick={this.handleSubmit}
        disabled={isSubmitting}
        bsStyle="primary"
      >
        {
          isSubmitting
          ? this.getIntlMessage('global.loading')
          : this.getIntlMessage('global.continue')
        }
      </Button>
    );
    return (
      <Panel header={header} footer={footer}>
        {/* <AccountForm
          isSubmitting={isSubmitting}
          initialValue={user.isPhoneConfirmed ? user.phone.slice(3, user.phone.length) : null}
        /> */}
      </Panel>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    user: state.default.user,
    isSubmitting: false,
  };
};

export default connect(mapStateToProps)(AccountBox);
