// @flow
import * as React from 'react';
import { Button, ListGroupItem } from 'react-bootstrap';
import Toggle from 'react-toggle';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import ListGroup from '../../Ui/List/ListGroup';
import type { Dispatch, FeatureToggle, FeatureToggles, State as GlobalState } from '../../../types';
import { toggleFeature } from '../../../redux/modules/default';

type Props = {|
  features: FeatureToggles,
  onToggle: (feature: FeatureToggle, value: boolean) => void,
|};

type State = {|
  showFranceConnectModal: boolean,
|};

export class ListPublicSSO extends React.Component<Props, State> {
  render() {
    const { onToggle, features } = this.props;

    return (
      <>
        <ListGroup>
          {features.login_franceconnect && (
            <ListGroupItem style={{ justifyContent: 'end' }}>
              <Toggle
                icons
                checked={features.login_franceconnect}
                onChange={() => onToggle('login_franceconnect', !features.login_franceconnect)}
              />
              <h5 className="mb-0 mt-0">
                <FormattedMessage id="capco.module.login_franceconnect" />
              </h5>
              <Button
                bsStyle="warning"
                className="btn-outline-warning"
                style={{ marginLeft: 'auto' }}
                onClick={() => {
                  this.setState((prevState: State) => ({
                    ...prevState,
                    showFranceConnectModal: !prevState.showFranceConnectModal,
                  }));
                }}>
                <i className="fa fa-pencil" /> <FormattedMessage id="global.edit" />
              </Button>
            </ListGroupItem>
          )}
          <ListGroupItem style={{ justifyContent: 'end' }}>
            <Toggle
              icons
              checked={features.login_facebook}
              onChange={() => onToggle('login_facebook', !features.login_facebook)}
            />
            <h5 className="mb-0 mt-0">Facebook</h5>
          </ListGroupItem>
          <ListGroupItem style={{ justifyContent: 'end' }}>
            <Toggle
              icons
              checked={features.login_gplus}
              onChange={() => onToggle('login_gplus', !features.login_gplus)}
            />
            <h5 className="mb-0 mt-0">Google</h5>
          </ListGroupItem>
          <ListGroupItem style={{ justifyContent: 'end' }}>
            <Toggle icons checked disabled />
            <h5 className="mb-0 mt-0">
              <FormattedMessage id="user.login.email" />
            </h5>
          </ListGroupItem>
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
