import * as React from 'react';
// import { connect } from 'react-redux';
import SmsCodeForm from './SmsCodeForm';
import PhoneForm from './PhoneForm';
// import { smsSentToNumber } from '../../../redux/modules/proposal';
// import { Panel } from 'react-bootstrap';

type Props = {
  user: Object,
  smsSentToNumber: boolean,
};

// ajouter <FormattedHTMLMessage id="phone.confirm.sent" phone={smsSentToNumber} />

export default class ProfileBox extends React.Component<Props> {
  render() {
    const { smsSentToNumber, user } = this.props;

    return (
      <div>
        {!smsSentToNumber ? (
          <PhoneForm
            user={user}
            initialValue={user.isPhoneConfirmed ? user.phone.slice(3, user.phone.length) : null}
          />
        ) : (
          <SmsCodeForm onSubmitSuccess="" /> // pour smsCodeForm, rajouter un reload de la page dans le onSubmit
        )}
      </div>
    );
  }
}

// connect avec le phoneForm pour le header et le footer du panel
// const mapStateToProps = () => ({
//   // smsSentToNumber: state.yolo.smsSentToNumber,
// });
//
// export default connect(mapStateToProps)(PhoneForm);
