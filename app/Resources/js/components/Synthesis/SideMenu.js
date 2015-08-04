import SynthesisElementStore from '../../stores/SynthesisElementStore';
import SynthesisElementActions from '../../actions/SynthesisElementActions';

const Link = ReactRouter.Link;


const SideMenu = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      countNew: 0,
    };
  },

  componentWillMount() {
    SynthesisElementStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    this.loadNewElementsCountFromServer();
  },

  componentWillUnmount() {
    SynthesisElementStore.removeChangeListener(this.onChange);
  },

  onChange() {
    if (SynthesisElementStore.isCountSync) {
      this.setState({
        countNew: SynthesisElementStore.countNew,
      });
      return;
    }
    this.loadNewElementsCountFromServer();
  },

  getContributionsMenuItems() {
    return [
      {
        'link': '/inbox/new',
        'color': 'blue',
        'icon': 'cap-download-6',
        'label': 'inbox',
        'nb': '(' + this.state.countNew + ')',
      },
      {
        'link': '/inbox/archived',
        'color': 'green',
        'icon': 'cap-check-4',
        'label': 'archived',
        'nb': null,
      },
      {
        'link': '/inbox/unpublished',
        'color': 'grey',
        'icon': 'cap-delete-2',
        'label': 'unpublished',
        'nb': null,
      },
      {
        'link': '/inbox/all',
        'color': 'grey',
        'icon': 'cap-baloon',
        'label': 'all',
        'nb': null,
      },
    ];
  },

  getFoldersMenuItems() {
    return [
      {
        'link': 'tree',
        'color': 'black',
        'icon': 'cap-folder-2',
        'label': 'tree',
        'nb': null,
      },
      {
        'link': 'new_folder',
        'color': 'black',
        'icon': 'cap-folder-add',
        'label': 'new_folder',
        'nb': null,
      },
    ];
  },

  renderMenu(items) {
    return (
      <div className="block menu__block">
        <ul className="nav">
            {
              items.map((item) => {
                return (
                  this.renderMenuItem(item)
                );
              })
              }
        </ul>
      </div>
    );
  },

  renderMenuItem(item) {
    return (
      <li key={item.label}>
        <Link to={item.link}>
          <div className="menu__icon"><i className={'cap ' + item.icon + ' icon--' + item.color}></i></div>
          <div className="menu__item">
            <h3 className="menu__item-title">{this.getIntlMessage('edition.menu.' + item.label)} {item.nb}</h3>
          </div>
        </Link>
      </li>
    );
  },

  render() {
    return (
      <div className="synthesis--edit__menu">
        <h2 className="h5 excerpt">{this.getIntlMessage('edition.menu.contributions')}</h2>
        {this.renderMenu(this.getContributionsMenuItems())}
        {this.renderMenu(this.getFoldersMenuItems())}
      </div>
    );
  },

  loadNewElementsCountFromServer() {
    SynthesisElementActions.loadElementsCountFromServer(
      this.props.synthesis.id,
      'new'
    );
  },

});

export default SideMenu;

