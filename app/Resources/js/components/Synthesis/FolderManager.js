import SynthesisElementStore from '../../stores/SynthesisElementStore';
import SynthesisElementActions from '../../actions/SynthesisElementActions';

import ElementIcon from './ElementIcon';
import ElementTitle from './ElementTitle';
import Loader from '../Utils/Loader';
import IgnoreButton from './IgnoreButton';

const FormattedMessage = ReactIntl.FormattedMessage;

const FolderManager = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      elements: [],
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
    SynthesisElementStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.fetchElements();
  },

  renderIgnoreButton(element) {
    if (element.displayType === 'folder') {
      return (
        <div className="pull-right">
          <IgnoreButton synthesis={this.props.synthesis} element={element}/>
        </div>
      );
    }
    return null;
  },

  renderItemCaret(element) {
    const classes = classNames({
      'tree__item__caret': true,
      'cap-arrow-67': this.state.expanded[element.id],
      'cap-arrow-66': !this.state.expanded[element.id],
    });
    if (element.childrenCount > 0) {
      return (
        <i className={classes} onClick={this.toggleExpand.bind(this, element)}></i>
      );
    }
  },

  renderTreeItems(elements, level) {
    if (elements) {
      return (
        <ul className={'tree__list tree--level-' + level}>
          {
            elements.map((element) => {
              return (
                <li className="tree__item">
                  {this.renderTreeItemContent(element)}
                  {this.state.expanded[element.id]
                    ? this.renderTreeItems(element.children, level + 1)
                    : null
                  }
                </li>
              );
            })
          }
        </ul>
      );
    }
  },

  renderTreeItemContent(element) {
    return (
      <div className="tree__item__content box">
        {this.renderItemCaret(element)}
        {this.renderIgnoreButton(element)}
        <ElementIcon className="tree__item__icon" element={element} />
        <ElementTitle element={element} className="tree__item__title" />
        <br/>
        <span className="small excerpt">
          <FormattedMessage
            message={this.getIntlMessage('common.elements.nb')}
            num={element.childrenCount}
            />
        </span>
      </div>
    );
  },

  render() {
    return (
      <div className="synthesis__tree">
        <Loader show={this.state.isLoading} />
        {this.renderTreeItems(this.state.elements, 0)}
      </div>
    );
  },

  toggleExpand(element) {
    if (element.childrenCount !== element.children.length) {
      SynthesisElementActions.loadElementsTreeFromServer(this.props.synthesis.id, 'all', element.id);
    }
    const expanded = this.state.expanded;
    expanded[element.id] = this.state.expanded[element.id] ? false : true;
    this.setState({
      expanded: expanded,
    });
  },

  showCreateModal() {
    this.setState({
      showCreateModal: true,
    });
  },

  hideCreateModal() {
    this.setState({
      showCreateModal: false,
    });
  },

  fetchElements() {
    if (!SynthesisElementStore.isFetchingTree) {
      if (SynthesisElementStore.isInboxSync.allTree) {
        this.setState({
          elements: SynthesisElementStore.elements.allTree,
          expanded: SynthesisElementStore.expandedNavbarItems,
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
      'all'
    );
  },

});

export default FolderManager;

