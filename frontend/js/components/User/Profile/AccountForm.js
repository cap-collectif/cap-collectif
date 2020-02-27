// @flow
import React, {useState} from 'react';
import {FormattedMessage, FormattedHTMLMessage, type IntlShape, injectIntl} from 'react-intl';
import {connect} from 'react-redux';
import {Alert, Button, Panel} from 'react-bootstrap';
import {submit, reduxForm, Field, formValueSelector} from 'redux-form';
import styled, {type StyledComponent} from 'styled-components';
import colors from '~/utils/colors';
import {isEmail} from '../../../services/Validator';
import renderComponent from '../../Form/Field';
import AlertForm from '../../Alert/AlertForm';
import type {State, Dispatch, FeatureToggles} from '../../../types';
import select from "~/components/Form/Select";
import type {LocaleMap} from "~ui/Button/SiteLanguageChangeButton";
import ConfirmPasswordModal from "~/components/User/ConfirmPasswordModal";
import {  submitAccountForm as onSubmit,
  resendConfirmation,
  cancelEmailChange,confirmPassword} from "~/redux/modules/user";
import DeleteAccountModal from "~/components/User/DeleteAccountModal";
import type {AccountBox_viewer} from "~relay/AccountBox_viewer.graphql";

export const form = 'account';
const validate = (
  values: { email: ?string, language: ?string },
  props: { initialValues: { email: string, language: ?string } },
): { email: ?string } => {
  const errors = {};

  if (!values.email) {
    errors.email = 'global.required';
  } else if (!isEmail(values.email)) {
    errors.email = 'proposal.vote.constraints.email';
  }

  if (values.email === props.initialValues.email
    && values.language === props.initialValues.language) {
    errors.email = 'global.change.required';
  }

  return errors;
};

type Props = {|
  ...ReduxFormFormProps,
  dispatch: Dispatch,
  newEmail?: ?string,
  newEmailToConfirm?: ?string,
  initialValues: Object,
  confirmationEmailResent: boolean,
  currentLanguage: ?string,
  +defaultLocale: string,
  +dispatch: Dispatch,
  +features: FeatureToggles,
  +languageList: Array<LocaleMap>,
  +intl: IntlShape,
  +viewer: AccountBox_viewer,
|};

const AccountContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
  .account-form-hint {
    padding-left: 15px;
    padding-bottom: 10px;
    font-size: 14px;
    color: ${colors.gray}
  }
`;


const FooterContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  justify-content: space-between;
  #delete-account-profile-button{
    background-color: ${colors.dangerColor}
  }
  #edit-account-profile-button{
    background-color: ${colors.primaryColor}
  }
`;

export const AccountForm = ({
                              intl,
                              features,
                              initialValues,
                              dispatch,
                              pristine,
                              handleSubmit,
                              confirmationEmailResent,
                              error,
                              newEmail,
                              newEmailToConfirm,
                              invalid,
                              valid,
                              submitSucceeded,
                              submitFailed,
                              submitting,
                              languageList,
  viewer
                            }: Props) => {

  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);


  const _renderLanguageSection = () => {
    if (features.unstable__multilangue) {

      const localeListOptions = languageList.map((languageObject: LocaleMap) => {
        return {value: languageObject.code, label: intl.formatMessage({ id: languageObject.translationKey })};
      });

      return (<>
        <label className="col-sm-3 control-label" htmlFor="display__language">
          <FormattedMessage id="display-language"/>
        </label>
        <div className="col-sm-6">
          <Field
            type="text"
            component={select}
            name="language"
            id="display__language"
            divClassName="col-sm-6 mb-10"
            options={localeListOptions}
          />
        </div>
        <span className="account-form-hint">
          <FormattedMessage id="display-language-hint"/>
        </span>
      </>);
    }
    return null;
  };


  const footer = (
    <div className="pl-15">
      <FooterContainer>
        <Button
          id="edit-account-profile-button"
          onClick={() => {
            if (initialValues.email === newEmail){
              setTimeout((): void => {
                dispatch(submit('account'));
              }, 1000);
            } else {
              dispatch(confirmPassword());
            }

          }}
          disabled={invalid || submitting}
          bsStyle="primary">
          {submitting ? (
            <FormattedMessage id="global.loading" />
          ) : (
            <FormattedMessage id="global.save_modifications" />
          )}
        </Button>
        <Button
          id="delete-account-profile-button"
          bsStyle="danger"
          onClick={() => setShowDeleteAccountModal(true)}
          style={{ marginLeft: 15 }}>
          <FormattedMessage id="delete-account" />
        </Button>
      </FooterContainer>
      {/* $FlowFixMe */}
      <DeleteAccountModal
        viewer={viewer}
        show={showDeleteAccountModal}
        handleClose={() => setShowDeleteAccountModal(false)}
      />
    </div>
  );


  return (
    <>
      <Panel.Body>
        <h2 className="page-header">
          <FormattedMessage id="profile.account.title" />
        </h2>
        <form onSubmit={handleSubmit} id="profile-account">
          {confirmationEmailResent && (
            <Alert bsStyle="warning">
              <FormattedMessage id="account.email_confirmation_sent"/>
            </Alert>
          )}
          <AccountContainer>
            <label className="col-sm-3 control-label" htmlFor="account__email">
              <FormattedMessage id="global.email"/>
            </label>
            <div>
              <Field
                type="email"
                component={renderComponent}
                name="email"
                id="account__email"
                divClassName="col-sm-6"
              />
            </div>
            <span className="account-form-hint">
              <i className="icon cap-lock-2"/>
              <FormattedMessage id="account.your_email_is_not_public"/>
            </span>
            {_renderLanguageSection()}

          </AccountContainer>

          {newEmailToConfirm && (
            <div className="col-sm-6 col-sm-offset-3">
              <p className="small excerpt">
                <FormattedHTMLMessage
                  id="user.confirm.profile_help"
                  values={{email: newEmailToConfirm}}
                />
              </p>
              <p className="small excerpt col-sm-6 col-sm-offset-3">
                <a href="#resend" onClick={() => resendConfirmation()}>
                  <FormattedMessage id="user.confirm.resend"/>
                </a>
                {' · '}
                <a href="#cancel" onClick={() => cancelEmailChange(dispatch, initialValues.email)}>
                  <FormattedMessage id="user.confirm.cancel"/>
                </a>
              </p>
            </div>
          )}
          <div className="col-sm-6 col-sm-offset-3" id="profile-alert-form">
            <AlertForm
              valid={pristine ? true : valid}
              invalid={pristine ? false : invalid}
              errorMessage={error}
              submitSucceeded={submitSucceeded}
              submitFailed={submitFailed}
              submitting={submitting}
            />
          </div>
        </form>
        {/* $FlowFixMe please use mapDispatchToProps */}
        <ConfirmPasswordModal />
      </Panel.Body>
      <Panel.Footer>{footer}</Panel.Footer>
    </>
  );
};

const mapStateToProps = (state: State, props: Props) => {
  return ({

    features: state.default.features,
    newEmailToConfirm: state.user.user && state.user.user.newEmailToConfirm,
    confirmationEmailResent: state.user.confirmationEmailResent,
    newEmail: formValueSelector('account')(state, 'email'),
    initialValues: {
      email: state.user.user && state.user.user.email,
      language: props.defaultLocale,
    },
  });
};

export default injectIntl(connect(mapStateToProps)(
  reduxForm({
    form,
    validate,
    onSubmit,
  })(AccountForm),
));
