import React, { PropTypes } from 'react';
import { IntlMixin, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Alert, Button } from 'react-bootstrap';
import Fetcher from '../../services/Fetcher';

export const NewEmailNotConfirmedAlert = React.createClass({
  propTypes: {
    newEmailToConfirm: PropTypes.string,
  },
  mixins: [IntlMixin],

  render() {
    const { newEmailToConfirm } = this.props;
    if (!newEmailToConfirm) {
      return null;
    }
    const editEmailUrl = `${window.location.protocol}//${window.location.host}/profile/edit-account`;
    return (
      <Alert bsStyle="warning" id="alert-new-email-not-confirmed">
        <div className="container">
          <div className="col-md-7" style={{ marginBottom: 5 }}>
            <FormattedHTMLMessage
              message={this.getIntlMessage('user.confirm.new_email')}
              email={newEmailToConfirm}
            />
          </div>
          <div className="col-md-5">
            <Button
              style={{ marginRight: 15, marginBottom: 5 }}
              onClick={() => {
                Fetcher.post('/resend-new-email-confirmation', {});
              }}
            >
              {
                this.getIntlMessage('user.confirm.resend')
              }
            </Button>
            <Button style={{ marginBottom: 5 }} href={editEmailUrl}>{ this.getIntlMessage('user.confirm.update') }</Button>
          </div>
        </div>
      </Alert>
    );
  },
});

const mapStateToProps = state => ({
  newEmailToConfirm: state.default.user.newEmailToConfirm,
});

export default connect(mapStateToProps)(NewEmailNotConfirmedAlert);
