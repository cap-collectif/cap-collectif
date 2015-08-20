import SynthesisElementStore from '../../stores/SynthesisElementStore';
import SynthesisElementActions from '../../actions/SynthesisElementActions';
import CreateButton from './CreateButton';
import CreateModal from './CreateModal';

const Link = ReactRouter.Link;

const SideMenu = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      countNew: 0,
      showCreateModal: false,
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
    this.toggleCreateModal(false);
  },

  onChange() {
    if (!SynthesisElementStore.isProcessing && SynthesisElementStore.isCountSync) {
      this.setState({
        countNew: SynthesisElementStore.countNew,
      });
      return;
    }
    this.loadNewElementsCountFromServer();
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
    ];
  },

  renderFoldersMenu() {
    const items = this.getFoldersMenuItems();
    return (
      <div className="block menu__block menu--folders">
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
            <h3 className="menu__item-title">{this.getIntlMessage('edition.sideMenu.' + item.label)} {item.nb}</h3>
          </div>
        </Link>
      </li>
    );
  },

  renderCreateModal() {
    return (
      <CreateModal synthesis={this.props.synthesis} show={this.state.showCreateModal} toggle={this.toggleCreateModal} />
    );
  },

  render() {
    return (
      <div className="synthesis__side-menu">
        {this.renderFoldersMenu()}
        <CreateButton className="button--down" parent={null} onModal={this.toggleCreateModal} />
        {this.renderCreateModal()}
      </div>
    );
  },

  toggleCreateModal(value) {
    this.setState({
      showCreateModal: value,
    });
  },

  loadNewElementsCountFromServer() {
    SynthesisElementActions.loadElementsCountFromServer(
      this.props.synthesis.id,
      'new'
    );
  },

});

export default SideMenu;

