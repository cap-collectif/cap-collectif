import SynthesisElementActions from '../../actions/SynthesisElementActions';
import SynthesisElementStore from '../../stores/SynthesisElementStore';
import NotationButtons from './NotationButtons';
import ElementsFinder from './ElementsFinder';

const Button = ReactBootstrap.Button;
const Modal = ReactBootstrap.Modal;
const Input = ReactBootstrap.Input;

const PublishModal = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
    element: React.PropTypes.object,
    show: React.PropTypes.bool,
    toggle: React.PropTypes.func,
    process: React.PropTypes.func,
  },
  mixins: [ReactIntl.IntlMixin, ReactRouter.Navigation, React.addons.LinkedStateMixin],

  getInitialState() {
    const element = this.props.element;
    return {
      notation: element ? element.notation : null,
      parent: element ? element.parent : null,
      comment: element ? element.comment : null,
      title: element ? element.title : null,
      elements: [],
      expanded: {
        root: true,
      },
      isLoading: true,
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
    this.fetchElements();
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.element) {
      if (!this.props.element || this.props.element.id !== nextProps.element.id) {
        this.setState({
          notation: nextProps.element.notation,
          parent: nextProps.element.parent,
          comment: nextProps.element.comment,
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

  renderTitle() {
    return (
      <div className="modal__action">
        <h2 className="h4">
          {' ' + this.getIntlMessage('edition.action.publish.field.title')}
        </h2>
          <Input type="text" id="publish_element_title" name="publish_element[title]" className="publish-element__title" valueLink={this.linkState('title')} />
      </div>
    );
  },

  renderParent() {
    return (
      <div className="modal__action">
        <h2 className="h4">
          {' ' + this.getIntlMessage('edition.action.publish.field.parent')}
        </h2>
        {this.renderParentFinder()}
      </div>
    );
  },

  renderParentFinder() {
    const parentId = this.state.parent ? this.state.parent.id : 'root';
    return (
      <ElementsFinder synthesis={this.props.synthesis} type="all" elements={this.state.elements} expanded={this.state.expanded} selectedId={parentId} onSelect={this.setParent} onExpand={this.expandItem} />
    );
  },

  renderNotation() {
    return (
      <div className="modal__action">
        <h2 className="h4">
          {' ' + this.getIntlMessage('edition.action.publish.field.notation')}
          <span className="small excerpt action__title-right">{'\t' + this.getIntlMessage('edition.action.publish.optional')}</span>
        </h2>
        <NotationButtons notation={this.state.notation} onChange={this.setNotation} block={true} />
        <p className="small excerpt action__help">{this.getIntlMessage('edition.action.publish.help.notation')}</p>
      </div>
    );
  },

  renderComment() {
    return (
      <div className="modal__action">
        <h2 className="h4">
          {' ' + this.getIntlMessage('edition.action.publish.field.comment')}
          <span className="small excerpt action__title-right">{'\t' + this.getIntlMessage('edition.action.publish.optional')}</span>
        </h2>
        <form id="publish_element" name="publish_element">
          <Input type="textarea" id="publish_element_comment" name="publish_element[comment]" className="publish-element__comment" valueLink={this.linkState('comment')} />
        </form>
      </div>
    );
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.hide} animation={false} dialogClassName="modal--publish">
        <Modal.Header closeButton>
          <Modal.Title>{this.getIntlMessage('edition.action.publish.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.renderTitle()}
          {this.renderParent()}
          {this.renderNotation()}
          {this.renderComment()}
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
      'comment': this.state.comment,
      'title': this.state.title,
    };
    if (typeof this.props.process === 'function') {
      const element = this.props.element;
      element.archived = data.archived;
      element.published = data.published;
      element.notation = data.notation;
      element.parent = data.parent;
      element.comment = data.comment;
      element.title = data.title;
      this.props.process(element);
      return;
    }
    SynthesisElementActions.archive(this.props.synthesis.id, this.props.element.id, data);
    this.transitionTo('inbox', {'type': 'new'});
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
          expanded: SynthesisElementStore.expandedNavbarItems,
          selectedId: SynthesisElementStore.selectedNavbarItem,
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

export default PublishModal;
