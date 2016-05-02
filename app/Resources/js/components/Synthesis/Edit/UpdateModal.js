import React from 'react';
import { IntlMixin } from 'react-intl';
import SynthesisElementActions from '../../../actions/SynthesisElementActions';
import SynthesisElementStore from '../../../stores/SynthesisElementStore';
import ElementsFinder from './../ElementsFinder';
import { Button, Modal, Input } from 'react-bootstrap';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';

const UpdateModal = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object.isRequired,
    element: React.PropTypes.object.isRequired,
    show: React.PropTypes.bool.isRequired,
    toggle: React.PropTypes.func.isRequired,
    process: React.PropTypes.func,
  },
  mixins: [IntlMixin, DeepLinkStateMixin],

  getDefaultProps() {
    return {
      process: null,
    };
  },

  getInitialState() {
    const element = this.props.element;
    return {
      parentId: this.getElementParentId(element),
      title: element ? element.title : null,
      description: element ? element.description : null,
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
          parentId: this.getElementParentId(nextProps.element),
          title: nextProps.element.title,
          description: nextProps.element.description,
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

  getElementParentId() {
    const parents = this.props.element.path.split('|');
    if (parents.length < 2) {
      return null;
    }
    const parent = parents[parents.length - 2].split('-');
    return parent.slice(parent.length - 5, parent.length).join('-');
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
      const value = element !== 'root' ? element.id : null;
      this.setState({
        parentId: value,
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
      'parent': this.state.parentId,
      'title': this.state.title,
      'description': this.state.description,
    };
    if (typeof this.props.process === 'function') {
      const element = this.props.element;
      element.parent = data.parent;
      element.title = data.title;
      element.description = data.description;
      this.props.process(element);
      return;
    }
    SynthesisElementActions.update(this.props.synthesis.id, this.props.element.id, data);
  },

  expandItem(element) {
    const expanded = this.state.expanded;
    expanded[element.id] = !this.state.expanded[element.id];
    this.setState({
      expanded: expanded,
    });
  },

  fetchElements() {
    if (!SynthesisElementStore.isFetchingTree) {
      if (SynthesisElementStore.isInboxSync.notIgnoredTree) {
        this.setState({
          elements: SynthesisElementStore.elements.notIgnoredTree,
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

  renderDescription() {
    return (
      <div className="modal__action">
        <h2 className="h4">
          {' ' + this.getIntlMessage('edition.action.update.field.description')}
        </h2>
        <Input type="textarea" id="update_element_description" name="update_element[description]" className="update-element__description" valueLink={this.linkState('description')} />
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
    const parentId = this.state.parentId || 'root';
    return (
      <ElementsFinder
        synthesis={this.props.synthesis}
        type="notIgnored"
        elements={this.state.elements}
        expanded={this.state.expanded}
        selectedId={parentId}
        onSelect={this.setParent}
        onExpand={this.expandItem}
        hiddenElementId={this.props.element.id}
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
          {this.renderDescription()}
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
