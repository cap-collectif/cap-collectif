import React from 'react';
import { IntlMixin } from 'react-intl';
import MainNavbar from './MainNavbar';
import SecondNavbar from './SecondNavbar';
import SideMenu from './SideMenu';
import TopMenu from './TopMenu';

const EditBox = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
    children: React.PropTypes.element,
  },
  mixins: [IntlMixin],

  render() {
    const synthesis = this.props.synthesis;
    const children = this.props.children;
    if (synthesis.editable) {
      return (
        <div className="synthesis__tool">
          <MainNavbar />
          <SecondNavbar />
          <div className="synthesis__container container-fluid">
            <div className="row">
              <div className="col--left col--scrollable col-xs-12 block--mobile">
                <SideMenu synthesis={synthesis} />
              </div>
              <div className="col--right col-xs-12 block--mobile">
                <TopMenu synthesis={synthesis} />
                <div className="synthesis__content">
                  { React.cloneElement(children, { synthesis: synthesis }) }
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
