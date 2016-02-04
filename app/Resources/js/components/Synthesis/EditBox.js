import React from 'react';
import { IntlMixin } from 'react-intl';
import MainNavbar from './MainNavbar';
import SecondNavbar from './SecondNavbar';
import SideMenu from './SideMenu';
import TopMenu from './TopMenu';
import { RouteHandler } from 'react-router';

const EditBox = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
  },
  mixins: [IntlMixin],

  render() {
    if (this.props.synthesis.editable) {
      return (
        <div className="synthesis__tool">
          <MainNavbar />
          <SecondNavbar />
          <div className="synthesis__container container-fluid">
            <div className="row">
              <div className="col--left col--scrollable col-xs-12 block--mobile">
                <SideMenu synthesis={this.props.synthesis} />
              </div>
              <div className="col--right col-xs-12 block--mobile">
                <TopMenu synthesis={this.props.synthesis} />
                <div className="synthesis__content">
                  <RouteHandler synthesis={this.props.synthesis} />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  },

});

export default EditBox;
