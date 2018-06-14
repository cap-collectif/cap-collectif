import React from 'react';
import PropTypes from 'prop-types';
import SettingsSideMenu from './SettingsSideMenu';

class Settings extends React.Component {
  static propTypes = {
    synthesis: PropTypes.object,
    params: PropTypes.object,
    children: PropTypes.object.isRequired,
  };

  static defaultProps = {
    params: { type: 'display' },
  };

  render() {
    const { children, synthesis } = this.props;
    return (
      <div className="row">
        <div className="col--left col--scrollable col-xs-12 block--mobile">
          <SettingsSideMenu />
        </div>
        <div className="col--right col-xs-12 block--mobile synthesis__settings">
          {React.cloneElement(children, { synthesis })}
        </div>
      </div>
    );
  }
}

export default Settings;
