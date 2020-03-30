// @flow
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { FormattedHTMLMessage, FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import styled, { type StyledComponent } from 'styled-components';
import { Button } from 'react-bootstrap';
import { Field, isSubmitting, reduxForm, SubmissionError, submit } from 'redux-form';
import component from '~/components/Form/Field';
import CheckCircle from '~ui/Icons/CheckCircle';
import type { Dispatch, State } from '~/types';
import Loader from '~ui/FeedbacksIndicators/Loader';
import UpdateRedirectIOProjectKey from '~/mutations/UpdateRedirectIOProjectKey';
import colors from '../../../utils/colors';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';

const formName = 'redirect-io-form';

const RedirectIoLogo: StyledComponent<{}, {}, HTMLImageElement> = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 10px;
`;

const RedirectIoContent: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  h4 {
    font-weight: bold;
    margin-top: 10px;
  }

  ol {
    padding-left: 15px;
  }

  .horizontal-flex {
    display: flex;
    flex-direction: row;
  }

  @media (min-width: 800px) {
    .project-key-flex {
      display: flex;
      flex-direction: row;

      input {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
      #project-key-verify {
        height: 34px;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    }
  }
  .box-header {
    display: flex;
    align-items: center;
    .box-title {
      display: flex;
      .horizontal-flex {
        align-items: center;
        .help-text {
          font-size: 14px !important;
        }
      }
    }
    .help-icon {
      margin-left: 10px;
      margin-right: 7px;
      margin-bottom: 3px;
    }
  }

  .green-text {
    color: #008000;
    font-size: 14px;
    margin-left: 5px;
  }

  .field-wrapper-div {
    flex: 1;
  }

  .section-container {
    margin-bottom: 15px;
  }
`;

type FormValues = {|
  projectId: ?string,
|};

type Props = {|
  projectKey: { value: ?string },
  ...FormValues,
  ...ReduxFormFormProps,
  submitting: boolean,
  dispatch: Dispatch,
  intl: IntlShape,
|};

export const RedirectIoAdminPage = (props: Props) => {
  const { submitting, projectKey, dispatch } = props;

  const [isTokenValid, setTokenValidity] = useState(
    projectKey.value && projectKey.value.length !== 0,
  );

  const renderValidToken = () => {
    if (!isTokenValid || submitting) {
      return null;
    }
    return (
      <>
        <div className="ml-10">
          <CheckCircle className="img-check-circle" color="#008000" size={15} />
        </div>
        <div className="green-text">
          <FormattedMessage id="global.saved" />
        </div>
      </>
    );
  };

  return (
    <RedirectIoContent>
      <div className="box box-primary container-fluid">
        <div className="box-header">
          <h3 className="box-title">
            <FormattedMessage id="custom-url" />

            <div className="horizontal-flex">
              <div className="help-icon">
                <Icon name={ICON_NAME.information} size={14} color="#3c8dbc" />
              </div>
              <div className="help-text">
                <FormattedHTMLMessage id="online.support" />
              </div>
            </div>
          </h3>
        </div>
        <div className="box-content">
          <div className="section-container">
            <h4>
              <RedirectIoLogo
                src="https://redirection.io/images/favicon.png?1583833053"
                alt="redirection-io logo"
              />
              Redirection.io
            </h4>
            <FormattedHTMLMessage id="redirect-service-description" />
          </div>

          <div className="section-container">
            <h4>
              <FormattedMessage id="http-process" />
            </h4>

            <ol>
              <li>
                <FormattedHTMLMessage id="activate-redirection-service-step1" />
              </li>
              <li>
                <FormattedHTMLMessage id="activate-redirection-service-step2" />
              </li>
              <li>
                <FormattedMessage id="activate-redirection-service-step3" />
              </li>
            </ol>
          </div>
          <div className="section-container">
            <h4 className="horizontal-flex">
              <div>
                <FormattedMessage id="project-key" />
              </div>

              {renderValidToken()}
            </h4>

            <div className="project-key-flex">
              <Field
                divClassName="field-wrapper-div"
                id="project-id"
                name="projectId"
                type="text"
                component={component}
              />

              <Button
                id="project-key-verify"
                bsStyle="primary"
                disabled={submitting}
                onClick={() => {
                  dispatch(submit(formName));
                  setTokenValidity(true);
                }}>
                {submitting ? (
                  <Loader inline size={20} color={colors.white} />
                ) : (
                  <FormattedMessage id="verify" />
                )}
              </Button>
            </div>
          </div>

          <div className="section-container">
            <h4>
              <FormattedMessage id="Set-up-http-redirects" />
            </h4>
            <FormattedHTMLMessage id="url-configuration-help-text" />
          </div>

          <div>
            <Button
              disabled={!isTokenValid}
              id="handle-url"
              bsStyle="primary"
              onClick={() => {
                window.open('https://redirection.io/manager/', '_blank');
              }}>
              <FormattedMessage id="handle-url" />
            </Button>
          </div>
        </div>
      </div>
    </RedirectIoContent>
  );
};

const validate = ({ projectId }: Props) => {
  const errors = {};
  if (!projectId || projectId.length === 0) {
    errors.projectKey = 'invalid-API-key';
  }

  return errors;
};

const mapStateToProps = (state: State, props: Props) => ({
  submitting: isSubmitting(formName)(state),
  initialValues: {
    projectId: props.projectKey.value,
  },
});

const onSubmit = ({ projectId }: FormValues, dispatch: Dispatch, props: Props) => {
  const { intl } = props;
  if (!projectId) {
    throw new SubmissionError({
      _error: intl.formatMessage({ id: 'invalid-API-key' }),
    });
  }
  const input = {
    projectId,
  };

  return UpdateRedirectIOProjectKey.commit({ input });
};

const formContainer = reduxForm({
  onSubmit,
  validate,
  form: formName,
})(RedirectIoAdminPage);

export default connect(mapStateToProps)(injectIntl(formContainer));
