import Fetcher from '../../services/Fetcher';
import SynthesisElementStore from '../../stores/SynthesisElementStore';
import SynthesisElementActions from '../../actions/SynthesisElementActions';

let Link = ReactRouter.Link;


var SideMenu = React.createClass({
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      countNew: 0
    };
  },

  componentWillMount() {
    SynthesisElementStore.addChangeListener(this.onChange);
  },

  componentWillUnmount() {
    SynthesisElementStore.removeChangeListener(this.onChange);
  },

  componentDidMount() {
    this.loadNewElementsCountFromServer();
  },

  render() {
    return (
      <div className="synthesis--edit__menu">
        <h2 className="h5 excerpt">{this.getIntlMessage("edition.menu.contributions")}</h2>
        {this.renderMenu(this.getContributionsMenuItems())}
        {this.renderMenu(this.getFoldersMenuItems())}
      </div>
    );
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
      <li>
        <Link to={item['link']}>
          <div className="menu__icon"><i className={"cap " + item['icon']  + " icon--" + item['color']}></i></div>
          <div className="menu__item">
            <h3 className="menu__item-title">{this.getIntlMessage('edition.menu.' + item['label'])} {item['nb']}</h3>
          </div>
        </Link>
      </li>
    );
  },

  getContributionsMenuItems() {
    return [
      {
        "link": "inbox",
        "color":"blue",
        "icon": "cap-download-6",
        "label": "inbox",
        "nb": '(' + this.state.countNew + ')'
      },
      {
        "link": "archived",
        "color":"green",
        "icon": "cap-check-4",
        "label": "archived",
        "nb": null
      },
      {
        "link": "unpublished",
        "color":"grey",
        "icon": "cap-delete-2",
        "label": "unpublished",
        "nb": null
      },
      {
        "link": "all",
        "color":"grey",
        "icon": "cap-baloon",
        "label": "all",
        "nb": null
      },
    ];
  },

  getFoldersMenuItems() {
    return [
      {
        "link": "tree",
        "color":"black",
        "icon": "cap-folder-2",
        "label": "tree",
        "nb": null
      },
      {
        "link": "new_folder",
        "color":"black",
        "icon": "cap-folder-add",
        "label": "new_folder",
        "nb": null
      },
    ];
  },

  onChange() {
    if (SynthesisElementStore.isSync) {
      this.setState({
        countNew: SynthesisElementStore.countNew
      });
      return;
    }
    this.loadNewElementsCountFromServer();
  },

  loadNewElementsCountFromServer() {
    SynthesisElementActions.loadNewElementsCountFromServer(
      this.props.synthesis.id
    );
  }

});

export default SideMenu;

