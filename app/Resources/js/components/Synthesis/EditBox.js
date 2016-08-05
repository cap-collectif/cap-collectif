import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import MainNavbar from './Navbars/MainNavbar';
import SecondNavbar from './Navbars/SecondNavbar';
import SideMenu from './Navbars/SideMenu';
import TopMenu from './Inbox/TopMenu';

const EditBox = React.createClass({
  propTypes: {
    synthesis: PropTypes.object,
    children: PropTypes.element,
    sideMenu: PropTypes.bool.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { synthesis, children, sideMenu } = this.props;
    if (synthesis.editable) {
      return (
        <div className="synthesis__tool">
          <MainNavbar />
          <SecondNavbar />
          <div className="synthesis__container container-fluid">
            {
              sideMenu
              ? <div className="row">
                <div className="col--left col--scrollable col-xs-12 block--mobile">
                  <SideMenu synthesis={synthesis} />
                </div>
                <div className="col--right col-xs-12 block--mobile">
                  <TopMenu synthesis={synthesis} />
                  <div className="synthesis__content">
                    { React.cloneElement(children, { synthesis }) }
                  </div>
                </div>
              </div>
              : React.cloneElement(children, { synthesis })
            }
          </div>
        </div>
      );
    }
  },

});

export default EditBox;
