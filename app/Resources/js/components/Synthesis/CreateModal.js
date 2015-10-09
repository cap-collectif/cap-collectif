import SynthesisElementStore from '../../stores/SynthesisElementStore';
import SynthesisElementActions from '../../actions/SynthesisElementActions';
import ElementsFinder from './ElementsFinder';
import Loader from '../Utils/Loader';

const Button = ReactBootstrap.Button;
const Modal = ReactBootstrap.Modal;
const Input = ReactBootstrap.Input;

const CreateModal = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
    selected: React.PropTypes.string,
    show: React.PropTypes.bool,
    toggle: React.PropTypes.func,
    process: React.PropTypes.func,
  },
  mixins: [ReactIntl.IntlMixin, ReactRouter.Navigation, React.addons.LinkedStateMixin],

  getInitialState() {
    return {
      isLoading: true,
      elementsTree: [],
      name: null,
      parent: null,
    };
  },

  getDefaultProps() {
    return {
      process: null,
    };
  },

  componentWillMount() {
    SynthesisElementStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    this.fetchElementsTree();
  },

  componentWillUnmount() {
    SynthesisElementStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.fetchElementsTree();
  },

  renderName() {
    return (
      <div className="modal__action">
        <h2 className="h4">
          {' ' + this.getIntlMessage('edition.action.create.name.label')}
        </h2>
        <Input type="text" id="new_element_title" name="new_element[title]" className="new-element__title" placeholder={this.getIntlMessage('edition.action.create.name.placeholder')} valueLink={this.linkState('name')} />
      </div>
    );
  },

  renderParent() {
    return (
      <div className="modal__action">
        <h2 className="h4">
          {' ' + this.getIntlMessage('edition.action.create.parent.label')}
          <span className="small excerpt action__title-right">{'\t' + this.getIntlMessage('edition.action.create.optional')}</span>
        </h2>
        <Loader show={this.state.isLoading} />
        {this.renderParentFinder()}
      </div>
    );
  },

  renderParentFinder() {
    if (!this.state.isLoading) {
      const parentId = this.state.parent ? this.state.parent.id : 'root';
      return (
        <ElementsFinder synthesis={this.props.synthesis} elements={this.state.elementsTree} selectedId={parentId} onSelect={this.setParent} />
      );
    }
  },

  render() {
    return (
    <Modal show={this.props.show} onHide={this.hide} animation={false} dialogClassName="modal--create">
      <Modal.Header closeButton>
        <Modal.Title>{this.getIntlMessage('edition.action.create.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {this.renderName()}
        {this.renderParent()}
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" onClick={this.hide.bind(null, this)}>{this.getIntlMessage('edition.action.create.btn_cancel')}</Button>
        <Button type="submit" bsStyle="primary" onClick={this.create.bind(null, this)}>{this.getIntlMessage('edition.action.create.btn_submit')}</Button>
      </Modal.Footer>
    </Modal>
    );
  },

  show() {
    this.props.toggle(true);
  },

  hide() {
    this.props.toggle(false);
  },

  setName(event) {
    this.setState({
      name: event.target.value,
    });
  },

  setParent(element) {
    if (element) {
      const value = element !== 'root' ? element : null;
      this.setState({
        parent: value,
      });
    }
  },

  create() {
    this.hide();
    const element = {
      'archived': true,
      'published': true,
      'title': this.state.name,
      'parent': this.state.parent,
    };
    if (typeof this.props.process === 'function') {
      this.props.process(element);
      return;
    }
    SynthesisElementActions.create(this.props.synthesis.id, element);
  },

  fetchElementsTree() {
    if (!SynthesisElementStore.isProcessing && SynthesisElementStore.isInboxSync.allTree) {
      this.setState({
        elementsTree: SynthesisElementStore.elements.allTree,
        isLoading: false,
      });
      return;
    }

    this.setState({
      isLoading: true,
    }, () => {
      this.loadElementsTreeFromServer();
    });
  },

  loadElementsTreeFromServer() {
    SynthesisElementActions.loadElementsTreeFromServer(
      this.props.synthesis.id,
      'all'
    );
  },

});

export default CreateModal;
