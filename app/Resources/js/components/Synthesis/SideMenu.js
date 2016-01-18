import SynthesisElementStore from '../../stores/SynthesisElementStore';
import SynthesisElementActions from '../../actions/SynthesisElementActions';

import CreateModal from './CreateModal';
import ElementsFinder from './ElementsFinder';
import Loader from '../Utils/Loader';

const Nav = ReactBootstrap.Nav;
const NavItem = ReactBootstrap.NavItem;
const NavItemLink = ReactRouterBootstrap.NavItemLink;

const SideMenu = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin, ReactRouter.Navigation],

  getInitialState() {
    return {
      showCreateModal: false,
      navItems: [],
      selectedId: 'root',
      expanded: {
        root: true,
      },
      isLoading: true,
    };
  },

  componentWillMount() {
    SynthesisElementStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    this.fetchElements();
  },

  componentWillUnmount() {
    this.toggleCreateModal(false);
    SynthesisElementStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.fetchElements();
  },

  toggleExpand(element) {
    SynthesisElementActions.expandTreeItem('nav', element.id, !this.state.expanded[element.id]);
  },

  selectItem(element) {
    SynthesisElementActions.selectNavItem(element.id);
    if (element.id !== 'root') {
      this.transitionTo('show_element', {'element_id': element.id});
    }
  },

  showCreateModal() {
    this.toggleCreateModal(true);
  },

  hideCreateModal() {
    this.toggleCreateModal(false);
  },

  toggleCreateModal(value) {
    this.setState({
      showCreateModal: value,
    });
  },

  fetchElements() {
    if (!SynthesisElementStore.isFetchingTree) {
      if (SynthesisElementStore.isInboxSync.notIgnoredTree) {
        this.setState({
          navItems: SynthesisElementStore.elements.notIgnoredTree,
          expanded: SynthesisElementStore.expandedItems.nav,
          selectedId: SynthesisElementStore.selectedNavItem,
          isLoading: false,
        });
        return;
      }

      this.setState({
        isLoading: true,
      }, () => {
        this.loadElementsTreeFromServer();
      });
    }
  },

  loadElementsTreeFromServer() {
    SynthesisElementActions.loadElementsTreeFromServer(
      this.props.synthesis.id,
      'notIgnored'
    );
  },

  renderContributionsButton() {
    return (
        <NavItemLink to="folder_manager" className="menu__link" bsStyle="link">
          <i className="cap cap-baloon"></i> {this.getIntlMessage('edition.sideMenu.contributions')}
        </NavItemLink>
    );
  },

  renderTree() {
    if (this.state.isLoading) {
      return <Loader show={this.state.isLoading} />;
    }
    return (
      <ElementsFinder
        synthesis={this.props.synthesis}
        elements={this.state.navItems}
        expanded={this.state.expanded}
        selectedId={this.state.selectedId}
        onExpand={this.toggleExpand}
        onSelect={this.selectItem}
        type="notIgnored"
        itemClass="menu__link"
      />
    );
  },

  renderCreateButton() {
    return (
      <NavItem className="menu__link menu__action" onClick={this.showCreateModal.bind(null, this)}>
          <i className="cap cap-folder-add"></i> {this.getIntlMessage('edition.action.create.label')}
      </NavItem>
    );
  },

  renderManageButton() {
    return (
      <NavItemLink className="menu__link menu__action" to="folder_manager">
        <i className="cap cap-folder-edit"></i> {this.getIntlMessage('edition.action.manage.label')}
      </NavItemLink>
    );
  },

  render() {
    return (
      <div className="synthesis__side-menu">
        <div className="menu__tree">
          {this.renderTree()}
        </div>
        <Nav stacked className="menu__actions menu--fixed">
          {this.renderCreateButton()}
          {this.renderManageButton()}
        </Nav>
        <CreateModal synthesis={this.props.synthesis} show={this.state.showCreateModal} toggle={this.toggleCreateModal} elements={this.state.navItems} selectedId={this.state.selectedId} />
      </div>
    );
  },

});

export default SideMenu;

