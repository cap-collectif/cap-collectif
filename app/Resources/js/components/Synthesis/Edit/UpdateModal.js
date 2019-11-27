import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Button, Modal } from 'react-bootstrap';
import SynthesisElementActions from '../../../actions/SynthesisElementActions';
import SynthesisElementStore from '../../../stores/SynthesisElementStore';
import ElementsFinder from './../ElementsFinder';
import Input from '../../Form/ReactBootstrapInput';

const UpdateModal = createReactClass({
  displayName: 'UpdateModal',

  propTypes: {
    synthesis: PropTypes.object.isRequired,
    element: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    process: PropTypes.func,
  },

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
    this.loadElementsTreeFromServer();
  },

  componentWillReceiveProps(nextProps) {
    const { element } = this.props;
    if (nextProps.element) {
      if (!element || element.id !== nextProps.element.id) {
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
    this.setState({
      elements: SynthesisElementStore.elements.notIgnoredTree,
      isLoading: false,
    });
  },

  getElementParentId() {
    const { element } = this.props;
    const parents = element.path.split('|');
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
        element.path.split(',').map(id => {
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
    const { toggle } = this.props;
    toggle(false);
  },

  show() {
    const { toggle } = this.props;
    toggle(true);
  },

  update() {
    const { process, synthesis } = this.props;
    this.hide();
    const data = {
      parent: this.state.parentId,
      title: this.state.title,
      description: this.state.description,
    };
    if (typeof process === 'function') {
      const element = this.props.element;
      element.parent = data.parent;
      element.title = data.title;
      element.description = data.description;
      process(element);
      return;
    }
    SynthesisElementActions.update(synthesis.id, this.props.element.id, data);
  },

  expandItem(element) {
    const expanded = this.state.expanded;
    expanded[element.id] = !this.state.expanded[element.id];
    this.setState({
      expanded,
    });
  },

  loadElementsTreeFromServer() {
    const { synthesis } = this.props;
    SynthesisElementActions.loadElementsTreeFromServer(synthesis.id, 'notIgnored');
  },

  renderTitle() {
    return (
      <div className="modal__action">
        <h2 className="h4">
          <FormattedMessage id='global.title' />
        </h2>
        <Input
          type="text"
          id="update_element_title"
          name="update_element[title]"
          className="update-element__title"
          onChange={e => {
            this.setState({
              title: e.target.value,
            });
          }}
        />
      </div>
    );
  },

  renderDescription() {
    return (
      <div className="modal__action">
        <h2 className="h4">
          <FormattedMessage id='global.description' />
        </h2>
        <Input
          type="textarea"
          id="update_element_description"
          name="update_element[description]"
          className="update-element__description"
          onChange={e => {
            this.setState({
              description: e.target.value,
            });
          }}
        />
      </div>
    );
  },

  renderParent() {
    return (
      <div className="modal__action">
        <h2 className="h4">
          <FormattedMessage id='synthesis.edition.action.publish.field.parent' />
        </h2>
        {this.renderParentFinder()}
      </div>
    );
  },

  renderParentFinder() {
    const { element, synthesis } = this.props;
    const parentId = this.state.parentId || 'root';
    return (
      <ElementsFinder
        synthesis={synthesis}
        type="notIgnored"
        elements={this.state.elements}
        expanded={this.state.expanded}
        selectedId={parentId}
        onSelect={this.setParent}
        onExpand={this.expandItem}
        hiddenElementId={element.id}
      />
    );
  },

  render() {
    const { show } = this.props;
    return (
      <Modal show={show} onHide={this.hide} animation={false} dialogClassName="modal--update">
        <Modal.Header closeButton>
          <Modal.Title>
            <FormattedMessage id="synthesis.edition.action.update.title" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.renderTitle()}
          {this.renderDescription()}
          {this.renderParent()}
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" onClick={this.hide}>
            <FormattedMessage id='global.cancel' />
          </Button>
          <Button bsStyle="primary" type="submit" onClick={this.update}>
            <FormattedMessage id="global.edit" />
          </Button>
        </Modal.Footer>
      </Modal>
    );
  },
});

export default UpdateModal;
