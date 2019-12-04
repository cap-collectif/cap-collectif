import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Nav, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import SynthesisElementStore from '../../../stores/SynthesisElementStore';
import SynthesisElementActions from '../../../actions/SynthesisElementActions';

import CreateModal from './../Create/CreateModal';
import ElementsFinder from './../ElementsFinder';
import Loader from '../../Ui/FeedbacksIndicators/Loader';

class SideMenu extends React.Component {
  static propTypes = {
    synthesis: PropTypes.object,
  };

  static contextTypes = {
    router: PropTypes.object.isRequired,
  };

  state = {
    showCreateModal: false,
    navItems: [],
    selectedId: 'root',
    expanded: {
      root: true,
    },
    isLoading: true,
  };

  componentWillMount() {
    SynthesisElementStore.addChangeListener(this.onChange);
  }

  componentDidMount() {
    this.loadElementsTreeFromServer();
  }

  componentWillUnmount() {
    this.toggleCreateModal(false);
    SynthesisElementStore.removeChangeListener(this.onChange);
  }

  onChange = () => {
    this.setState({
      navItems: SynthesisElementStore.elements.notIgnoredTree,
      expanded: SynthesisElementStore.expandedItems.nav,
      selectedId: SynthesisElementStore.selectedNavItem,
      isLoading: false,
    });
  };

  toggleExpand = element => {
    SynthesisElementActions.expandTreeItem('nav', element.id, !this.state.expanded[element.id]);
  };

  selectItem = element => {
    SynthesisElementActions.selectNavItem(element.id);
    if (element.id !== 'root') {
      this.context.router.push(`element/${element.id}`);
    }
  };

  showCreateModal = () => {
    this.toggleCreateModal(true);
  };

  hideCreateModal = () => {
    this.toggleCreateModal(false);
  };

  toggleCreateModal = value => {
    this.setState({
      showCreateModal: value,
    });
  };

  loadElementsTreeFromServer = () => {
    const { synthesis } = this.props;
    SynthesisElementActions.loadElementsTreeFromServer(synthesis.id, 'notIgnored');
  };

  renderContributionsButton = () => {
    return (
      <LinkContainer to="/folder_manager">
        <NavItem className="menu__link" bsStyle="link">
          <i className="cap cap-baloon" />{' '}
          {<FormattedMessage id="synthesis.edition.sideMenu.contributions" />}
        </NavItem>
      </LinkContainer>
    );
  };

  renderTree = () => {
    const { synthesis } = this.props;
    if (this.state.isLoading) {
      return <Loader show={this.state.isLoading} />;
    }
    return (
      <ElementsFinder
        synthesis={synthesis}
        elements={this.state.navItems}
        expanded={this.state.expanded}
        selectedId={this.state.selectedId}
        onExpand={this.toggleExpand}
        onSelect={this.selectItem}
        type="notIgnored"
        itemClass="menu__link"
      />
    );
  };

  renderCreateButton = () => {
    return (
      <NavItem className="menu__link menu__action" onClick={this.showCreateModal.bind(null, this)}>
        <i className="cap cap-folder-add" />{' '}
        {<FormattedMessage id='synthesis.edition.action.create.title' />}
      </NavItem>
    );
  };

  renderManageButton = () => {
    return (
      <LinkContainer to="/folder-manager">
        <NavItem className="menu__link menu__action">
          <i className="cap cap-folder-edit" />{' '}
          {<FormattedMessage id="synthesis.edition.action.manage.label" />}
        </NavItem>
      </LinkContainer>
    );
  };

  render() {
    const { synthesis } = this.props;
    return (
      <div className="synthesis__side-menu">
        <div className="menu__tree">{this.renderTree()}</div>
        <Nav stacked className="menu__actions menu--fixed">
          {this.renderCreateButton()}
          {this.renderManageButton()}
        </Nav>
        <CreateModal
          synthesis={synthesis}
          show={this.state.showCreateModal}
          toggle={this.toggleCreateModal}
          elements={this.state.navItems}
          selectedId={this.state.selectedId}
        />
      </div>
    );
  }
}

export default SideMenu;
