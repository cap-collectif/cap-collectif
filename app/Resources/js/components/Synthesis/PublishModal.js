import SynthesisElementStore from '../../stores/SynthesisElementStore';
import SynthesisElementActions from '../../actions/SynthesisElementActions';
import NotationButtons from './NotationButtons';
import ElementsFinder from './ElementsFinder';

const Button = ReactBootstrap.Button;
const Modal = ReactBootstrap.Modal;

const PublishModal = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
    element: React.PropTypes.object,
    show: React.PropTypes.bool,
    toggle: React.PropTypes.func,
    process: React.PropTypes.func,
  },
  mixins: [ReactIntl.IntlMixin, ReactRouter.Navigation],

  getInitialState() {
    return {
      notation: this.props.element ? this.props.element.notation : null,
      parent: this.props.element ? this.props.element.parent : null,
      isLoading: true,
      elementsTree: [],
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
    this.loadElementsTreeFromServer();
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.element) {
      if (!this.props.element || this.props.element.id !== nextProps.element.id) {
        this.setState({
          notation: nextProps.element.notation,
          parent: nextProps.element.parent,
        });
      }
    }
  },

  componentWillUnmount() {
    SynthesisElementStore.removeChangeListener(this.onChange);
  },

  onChange() {
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

  renderLoader() {
    if (this.state.isLoading) {
      return (
        <div className= "row">
          <div className="col-xs-2 col-xs-offset-5 spinner-loader-container">
            <div className="spinner-loader"></div>
          </div>
        </div>
      );
    }
  },

  renderNotation() {
    return (
      <div className="modal__action">
        <h2 className="h4">
          <i className="cap cap-star-1-1"></i>
          {' ' + this.getIntlMessage('edition.action.publish.notation.title')}
          <span className="small excerpt action__title-right">{'\t' + this.getIntlMessage('edition.action.publish.optional')}</span>
        </h2>
        <NotationButtons notation={this.state.notation} onChange={this.setNotation} block={true} />
        <p className="small excerpt action__help">{this.getIntlMessage('edition.action.publish.notation.help')}</p>
      </div>
    );
  },

  renderParent() {
    return (
      <div className="modal__action">
        <h2 className="h4">
          <i className="cap cap-folder-2-1"></i>
          {' ' + this.getIntlMessage('edition.action.publish.parent.title')}
          <span className="small excerpt action__title-right">{'\t' + this.getIntlMessage('edition.action.publish.optional')}</span>
        </h2>
        {this.renderLoader()}
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
    <Modal show={this.props.show} onHide={this.hide} animation={false} dialogClassName="modal--publish">
      <Modal.Header closeButton>
        <Modal.Title>{this.getIntlMessage('edition.action.publish.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {this.renderNotation()}
        {this.renderParent()}
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" onClick={this.hide.bind(null, this)}>{this.getIntlMessage('edition.action.publish.btn_cancel')}</Button>
        <Button bsStyle="primary" type="submit" onClick={this.publish.bind(null, this)}>{this.getIntlMessage('edition.action.publish.btn_submit')}</Button>
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

  setNotation(notation) {
    this.setState({
      notation: notation,
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

  publish() {
    this.hide();
    const data = {
      'archived': true,
      'published': true,
      'notation': this.state.notation ? this.state.notation : 0,
      'parent': this.state.parent,
    };
    if (typeof this.props.process === 'function') {
      const element = this.props.element;
      element.archived = data.archived;
      element.published = data.published;
      element.notation = data.notation;
      element.parent = data.parent;
      this.props.process(element);
      return;
    }
    SynthesisElementActions.archive(this.props.synthesis.id, this.props.element.id, data);
    this.transitionTo('inbox', {'type': 'new'});
  },

  loadElementsTreeFromServer() {
    SynthesisElementActions.loadElementsTreeFromServer(
      this.props.synthesis.id,
      'all'
    );
  },

});

export default PublishModal;
