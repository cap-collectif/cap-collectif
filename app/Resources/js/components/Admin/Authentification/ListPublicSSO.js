// @flow
import * as React from 'react';
import { Button, ListGroupItem } from 'react-bootstrap';
import Toggle from 'react-toggle';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import ListGroup from '../../Ui/List/ListGroup';
import type { Dispatch, FeatureToggle, FeatureToggles, State as GlobalState } from '../../../types';
import { toggleFeature } from '../../../redux/modules/default';
import FranceConnectConfigurationModal from './FranceConnectConfigurationModal';

type Props = {|
  features: FeatureToggles,
  onToggle: (feature: FeatureToggle, value: boolean) => void,
|};

type State = {|
  showFranceConnectModal: boolean,
|};

const ListGroupItemWithJustifyContentEnd = styled(ListGroupItem)`
  && {
    justify-content: end;
  }
`;

const ButtonWithMarginLeftAuto = styled(Button)`
  && {
    margin-left: auto;
  }
`;

export class ListPublicSSO extends React.Component<Props, State> {
  state = {
    showFranceConnectModal: false,
  };

  handleClose = () => {
    this.setState({ showFranceConnectModal: false });
  };

  render() {
    const { onToggle, features } = this.props;
    const { showFranceConnectModal } = this.state;

    return (
      <>
        <ListGroup>
          {features.login_franceconnect && (
            <ListGroupItemWithJustifyContentEnd>
              <Toggle
                icons
                checked={features.login_franceconnect}
                onChange={() => onToggle('login_franceconnect', !features.login_franceconnect)}
              />
              <h5 className="mb-0 mt-0">
                <FormattedMessage id="capco.module.login_franceconnect" />
              </h5>
              <ButtonWithMarginLeftAuto
                bsStyle="warning"
                className="btn-outline-warning"
                onClick={() => {
                  this.setState((prevState: State) => ({
                    ...prevState,
                    showFranceConnectModal: !prevState.showFranceConnectModal,
                  }));
                }}>
                <i className="fa fa-pencil" /> <FormattedMessage id="global.edit" />
              </ButtonWithMarginLeftAuto>
              <FranceConnectConfigurationModal
                show={showFranceConnectModal}
                onClose={this.handleClose}
              />
            </ListGroupItemWithJustifyContentEnd>
          )}
          <ListGroupItemWithJustifyContentEnd>
            <Toggle
              icons
              checked={features.login_facebook}
              onChange={() => onToggle('login_facebook', !features.login_facebook)}
            />
            <h5 className="mb-0 mt-0">Facebook</h5>
          </ListGroupItemWithJustifyContentEnd>
          <ListGroupItemWithJustifyContentEnd>
            <Toggle
              icons
              checked={features.login_gplus}
              onChange={() => onToggle('login_gplus', !features.login_gplus)}
            />
            <h5 className="mb-0 mt-0">Google</h5>
          </ListGroupItemWithJustifyContentEnd>
          <ListGroupItemWithJustifyContentEnd>
            <Toggle icons checked disabled />
            <h5 className="mb-0 mt-0">
              <FormattedMessage id="user.login.email" />
            </h5>
          </ListGroupItemWithJustifyContentEnd>
        </ListGroup>
      </>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  features: state.default.features,
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  onToggle: (feature: FeatureToggle, value: boolean) => {
    toggleFeature(dispatch, feature, value);
  },
});

const connector = connect(
  mapStateToProps,
  mapDispatchToProps,
);
export default connector(ListPublicSSO);
