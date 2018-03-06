import React from 'react';
import { FormattedMessage } from 'react-intl';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const SettingsSideMenu = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  render() {
    return (
      <div className="synthesis__side-menu">
        <div className="menu__tree" style={{ paddingBottom: 0 }}>
          <div className="synthesis__tree">
            <ListGroup className="tree__list tree--level-0">
              <LinkContainer to={'/settings/display'}>
                <ListGroupItem className="tree__item">
                  <div className="tree__item__content">
                    <i className="cap cap-book-1 tree__item__icon" />
                    <span className="tree__item__title">
                      {<FormattedMessage id="synthesis.settings.menu.display" />}
                    </span>
                  </div>
                </ListGroupItem>
              </LinkContainer>
            </ListGroup>
          </div>
        </div>
      </div>
    );
  }
});

export default SettingsSideMenu;
