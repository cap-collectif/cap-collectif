// import React from 'react';
// import { FormattedMessage } from 'react-intl';
// import FlashMessages from '../../Utils/FlashMessages';
// import UserActions from '../../../actions/UserActions';
// import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
// import Input from '../../Form/Input';
// import FormMixin from '../../../utils/FormMixin';
//
// const PhoneForm = React.createClass({
//   propTypes: {
//     isSubmitting: PropTypes.bool.isRequired,
//     onSubmit: PropTypes.func.isRequired,
//     onSubmitSuccess: PropTypes.func.isRequired,
//     onSubmitFailure: PropTypes.func.isRequired,
//     initialValue: PropTypes.string,
//   },
//
//   mixins: [DeepLinkStateMixin, FormMixin],
//
//   getDefaultProps() {
//     return {
//       initialValue: null,
//     };
//   },
//
//   getInitialState() {
//     const { initialValue } = this.props;
//     return {
//       form: {
//         phone: initialValue || '',
//       },
//       errors: {
//         phone: [],
//       },
//     };
//   },
//
//   componentWillReceiveProps(nextProps) {
//     const { onSubmitFailure, onSubmitSuccess } = this.props;
//     if (nextProps.isSubmitting) {
//       const form = JSON.parse(JSON.stringify(this.state.form));
//       form.phone = form.phone.replace(/((?![0-9]).)/g, '');
//       form.phone = `+33${form.phone.charAt(0) === '0' ? form.phone.substring(1) : form.phone}`;
//       UserActions.update(form)
//         .then(() => {
//           UserActions.sendConfirmSms()
//             .then(() => {
//               onSubmitSuccess(form.phone);
//               this.setState(this.getInitialState());
//             })
//             .catch(err => {
//               const errors = this.state.errors;
//               if (err.response.message === 'sms_failed_to_send') {
//                 errors.phone = ['phone.confirm.alert.failed_to_send'];
//                 this.setState({ errors });
//               } else if (err.response.message === 'sms_already_sent_recently') {
//                 errors.phone = ['phone.confirm.alert.wait_for_new'];
//                 this.setState({ errors });
//               } else {
//                 this.setState(this.getInitialState());
//               }
//               onSubmitFailure();
//             });
//         })
//         .catch(error => {
//           const response = error.response;
//           if (response.errors) {
//             const errors = this.state.errors;
//             if (
//               response.errors.children.phone.errors &&
//               response.errors.children.phone.errors.length > 0
//             ) {
//               if (response.errors.children.phone.errors[0] === 'already_used_phone') {
//                 errors.phone = ['profile.constraints.phone.already_used'];
//               } else {
//                 errors.phone = ['profile.constraints.phone.invalid'];
//               }
//             }
//             this.setState({ errors });
//           }
//           onSubmitFailure();
//         });
//     }
//   },
//
//   formValidationRules: {
//     phone: {
//       notBlank: { message: 'global.constraints.notBlank' },
//     },
//   },
//
//   renderFormErrors(field) {
//     const errors = this.getErrorsMessages(field);
//     if (errors.length === 0) {
//       return null;
//     }
//     return <FlashMessages errors={errors} form />;
//   },
//
//   render() {
//     const { initialValue, onSubmit } = this.props;
//     return (
//       <form
//         style={{ maxWidth: '350px' }}
//         onSubmit={e => {
//           e.preventDefault();
//           onSubmit();
//         }}>
//         <Input
//           type="text"
//           addonBefore="+33"
//           autoFocus
//           valueLink={this.linkState('form.phone')}
//           id="_phone"
//           disabled={this.state.form.phone === initialValue}
//           label={<FormattedMessage id="global.phone" />}
//           groupClassName={this.getGroupStyle('phone')}
//           errors={this.renderFormErrors('phone')}
//         />
//       </form>
//     );
//   },
// });
//
// export default PhoneForm;
