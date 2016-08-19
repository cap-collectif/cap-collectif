import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import SettingsSideMenu from './SettingsSideMenu';

const Settings = React.createClass({
  propTypes: {
    synthesis: PropTypes.object,
    params: PropTypes.object,
    children: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      params: { type: 'display' },
    };
  },

  render() {
    const {
      children,
      synthesis,
    } = this.props;
    return (
      <div className="row">
        <div className="col--left col--scrollable col-xs-12 block--mobile">
          <SettingsSideMenu />
        </div>
        <div className="col--right col-xs-12 block--mobile synthesis__settings">
          { React.cloneElement(children, { synthesis }) }
        </div>
      </div>
    );
  },

});

export default Settings;
