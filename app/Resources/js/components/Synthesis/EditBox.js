import React from 'react';
import PropTypes from 'prop-types';
import MainNavbar from './Navbars/MainNavbar';
import SecondNavbar from './Navbars/SecondNavbar';
import SideMenu from './Navbars/SideMenu';
import TopMenu from './Inbox/TopMenu';

class EditBox extends React.Component {
  static propTypes = {
    synthesis: PropTypes.object,
    children: PropTypes.element,
    sideMenu: PropTypes.bool.isRequired,
  };

  render() {
    const { synthesis, children, sideMenu } = this.props;
    if (synthesis.editable) {
      return (
        <div className="synthesis__tool">
          <MainNavbar />
          <SecondNavbar />
          <div className="synthesis__container container-fluid">
            {sideMenu ? (
              <div className="row">
                <div className="col--left col--scrollable col-xs-12 block--mobile">
                  <SideMenu synthesis={synthesis} />
                </div>
                <div className="col--right col-xs-12 block--mobile">
                  <TopMenu synthesis={synthesis} />
                  <div className="synthesis__content">
                    {React.cloneElement(children, { synthesis })}
                  </div>
                </div>
              </div>
            ) : (
              React.cloneElement(children, { synthesis })
            )}
          </div>
        </div>
      );
    }
  }
}

export default EditBox;
