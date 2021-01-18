// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Toggle from '~/components/Ui/Toggle/Toggle';
import { toggleFeature } from '~/redux/modules/default';
import type { State, Dispatch, FeatureToggle, FeatureToggles } from '~/types';

type Props = {|
  features: FeatureToggles,
  onToggle: (feature: FeatureToggle, value: boolean) => void,
  isSuperAdmin: boolean,
|};

export const SSOByPassAuthForm = ({ onToggle, features, isSuperAdmin }: Props) =>
  isSuperAdmin && (
    <div className="box box-primary container-fluid">
      <div className="box-header">
        <h3 className="box-title">
          <FormattedMessage id="option" />
        </h3>
      </div>
      <div className="box-content box-content__content-form">
        <div className="d-flex flex-row align-items-baseline mb-15">
          <Toggle
            id="toggle-sso-by-pass-auth"
            checked={features.sso_by_pass_auth}
            onChange={() => onToggle('sso_by_pass_auth', !features.sso_by_pass_auth)}
            label={
              <div className="d-flex flex-column">
                <FormattedMessage id="instant-authentication" tagName="strong" />
                <div className="color-dark-gray">
                  <FormattedMessage id="bypass-the-selection-of-an-authentication-method" />
                </div>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );

const mapStateToProps = (state: State) => ({
  features: state.default.features,
  isSuperAdmin: !!(state.user.user && state.user.user.roles.includes('ROLE_SUPER_ADMIN')),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onToggle: (feature: FeatureToggle, value: boolean) => {
    toggleFeature(dispatch, feature, value);
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(SSOByPassAuthForm);
