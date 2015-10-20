import SynthesisElementActions from '../../actions/SynthesisElementActions';
import SynthesisElementStore from '../../stores/SynthesisElementStore';
import ElementsFinder from './ElementsFinder';

const Button = ReactBootstrap.Button;
const Modal = ReactBootstrap.Modal;
const Input = ReactBootstrap.Input;

const UpdateModal = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object.isRequired,
    element: React.PropTypes.object.isRequired,
    show: React.PropTypes.bool.isRequired,
    toggle: React.PropTypes.func.isRequired,
    process: React.PropTypes.func,
  },
  mixins: [ReactIntl.IntlMixin, React.addons.LinkedStateMixin],

  getDefaultProps() {
    return {
      process: null,
    };
  },

  getInitialState() {
    const element = this.props.element;
    return {
      parent: element ? element.parent : null,
      title: element ? element.title : null,
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.element) {
      if (!this.props.element || this.props.element.id !== nextProps.element.id) {
        this.setState({
          parent: nextProps.element.parent,
          title: nextProps.element.title,
          expanded: this.getExpandedBasedOnElement(),
        });
      }
    }
  },

  componentWillUnmount() {
    SynthesisElementStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.fetchElements();
  },

  getExpandedBasedOnElement() {
    const expanded = {
      root: true,
    };
    const element = this.props.element;
    if (this.state.elements && element && element.id !== 'root') {
      expanded[element.id] = true;
      if (element) {
        element.path.split(',').map((id) => {
          expanded[id] = true;
        });
      }
    }
    return expanded;
  },

  setParent(element) {
    if (element) {
      const value = element !== 'root' ? element : null;
      this.setState({
        parent: value,
      });
    }
  },

  hide() {
    this.props.toggle(false);
  },

  show() {
    this.props.toggle(true);
  },

  update() {
    this.hide();
    const data = {
      'parent': this.state.parent,
      'title': this.state.title,
    };
    if (typeof this.props.process === 'function') {
      const element = this.props.element;
      element.parent = data.parent;
      element.title = data.title;
      this.props.process(element);
      return;
    }
    SynthesisElementActions.update(this.props.synthesis.id, this.props.element.id, data);
  },

  expandItem(element) {
    const expanded = this.state.expanded;
    expanded[element.id] = this.state.expanded[element.id] ? false : true;
    this.setState({
      expanded: expanded,
    });
  },

  fetchElements() {
    if (!SynthesisElementStore.isFetchingTree) {
      if (SynthesisElementStore.isInboxSync.allTree) {
        this.setState({
          elements: SynthesisElementStore.elements.allTree,
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

  renderTitle() {
    return (
      <div className="modal__action">
        <h2 className="h4">
          {' ' + this.getIntlMessage('edition.action.update.field.title')}
        </h2>
        <Input type="text" id="update_element_title" name="update_element[title]" className="update-element__title" valueLink={this.linkState('title')} />
      </div>
    );
  },

  renderParent() {
    return (
      <div className="modal__action">
        <h2 className="h4">
          {' ' + this.getIntlMessage('edition.action.update.field.parent')}
        </h2>
        {this.renderParentFinder()}
      </div>
    );
  },

  renderParentFinder() {
    const parentId = this.state.parent ? this.state.parent.id : 'root';
    return (
      <ElementsFinder
        synthesis={this.props.synthesis}
        type="all"
        elements={this.state.elements}
        expanded={this.state.expanded}
        selectedId={parentId}
        onSelect={this.setParent}
        onExpand={this.expandItem}
        />
    );
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.hide} animation={false} dialogClassName="modal--update">
        <Modal.Header closeButton>
          <Modal.Title>{this.getIntlMessage('edition.action.update.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.renderTitle()}
          {this.renderParent()}
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" onClick={this.hide.bind(null, this)}>{this.getIntlMessage('edition.action.update.btn_cancel')}</Button>
          <Button bsStyle="primary" type="submit" onClick={this.update.bind(null, this)}>{this.getIntlMessage('edition.action.update.btn_submit')}</Button>
        </Modal.Footer>
      </Modal>
    );
  },

});

export default UpdateModal;
