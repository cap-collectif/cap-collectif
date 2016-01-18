const Nav = ReactBootstrap.Nav;
const NavItemLink = ReactRouterBootstrap.NavItemLink;

const TopMenu = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  getMenuItems() {
    return [
      {
        'link': '/inbox/new',
        'color': 'blue',
        'icon': 'cap-download-6',
        'label': 'inbox',
      },
      {
        'link': '/inbox/archived',
        'color': 'orange',
        'icon': 'cap-check-4',
        'label': 'archived',
      },
      {
        'link': '/inbox/published',
        'color': 'green',
        'icon': 'cap-tag-1',
        'label': 'published',
      },
      {
        'link': '/inbox/unpublished',
        'color': 'gray',
        'icon': 'cap-delete-2',
        'label': 'unpublished',
      },
      {
        'link': '/inbox/all',
        'color': 'black',
        'icon': 'cap-baloon',
        'label': 'all',
      },
    ];
  },

  renderMenuItem(item) {
    const menuItemClass = 'menu__item--' + item.color;
    const iconClass = 'icon--' + item.color;
    return (
      <NavItemLink to={item.link} className={'menu__item ' + menuItemClass}>
          <i style={{fontSize: '25px'}} className={'cap ' + item.icon + ' ' + iconClass}></i> <span className="hidden-sm">{this.getIntlMessage('edition.topMenu.' + item.label)}</span>
      </NavItemLink>
    );
  },

  render() {
    const items = this.getMenuItems();
    return (
      <Nav bsStyle="tabs" justified className="synthesis__top-menu">
        {
          items.map((item) => {
            return (
              this.renderMenuItem(item)
            );
          })
        }
      </Nav>
    );
  },

});

export default TopMenu;
