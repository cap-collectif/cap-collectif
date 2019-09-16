import React from 'react';
import ReactDOM from 'react-dom';
import { FormattedMessage } from 'react-intl';
import { Modal, Button, Grid, Row, Col, OverlayTrigger } from 'react-bootstrap';
import autosize from 'autosize';
import classNames from 'classnames';
import { hashHistory } from 'react-router';

import SynthesisElementActions from '../../../actions/SynthesisElementActions';
import ArrayHelper from '../../../services/ArrayHelper';
import FormattedText from '../../../services/FormattedText';

import ElementTitle from './../Element/ElementTitle';
import ElementBreadcrumb from './../Element/ElementBreadcrumb';

import PublishButton from './../Publish/PublishButton';
import RemoveButton from './../Delete/RemoveButton';

import PublishModal from './../Publish/PublishModal';
import Popover from '../../Utils/Popover';

type Props = {
  synthesis: Object,
  element: Object,
  show: boolean,
  toggle: Function,
};

type State = {
  newElements: Object | Array<Object>,
  currentElement: Object,
  showPublishModal: boolean,
  selectedText: ?string,
};

class DivideModal extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    const { element } = props;

    this.state = {
      newElements: element.division ? element.division.elements : [],
      currentElement: null,
      showPublishModal: false,
      selectedText: null,
    };
  }

  componentDidUpdate() {
    autosize(ReactDOM.findDOMNode(this.refs.originalText));
  }

  componentWillUnmount() {
    autosize.destroy(ReactDOM.findDOMNode(this.refs.originalText));
    this.togglePublishModal(false);
  }

  getSelectedText = obj => {
    if (typeof obj !== 'undefined') {
      const start = obj.selectionStart;
      const end = obj.selectionEnd;
      if (start !== end) {
        return obj.value.substring(start, end);
      }
    }
    return null;
  };

  show = () => {
    const { toggle } = this.props;
    toggle(true);
  };

  hide = () => {
    const { toggle } = this.props;
    toggle(false);
  };

  togglePublishModal = (value, element = null) => {
    this.setState({
      currentElement: element || this.state.currentElement,
      showPublishModal: value,
    });
  };

  selectText = () => {
    const selectedText = this.getSelectedText(ReactDOM.findDOMNode(this.refs.originalText));
    this.setState({
      selectedText,
    });
  };

  createFromSelection = () => {
    const { element } = this.props;
    const body = this.state.selectedText;
    if (body && body !== '') {
      const newElement = {
        title: null,
        body,
        archived: false,
        published: false,
        parent: element.parent,
      };
      this.addElement(newElement);
      this.togglePublishModal(true, newElement);
    }
  };

  processPublishedElement = element => {
    this.removeElement(element);
    this.addElement(element);
  };

  addElement = element => {
    let newElements = this.state.newElements;
    newElements = ArrayHelper.addElementToArray(newElements, element, 'body');
    this.setState({
      newElements,
      selectedText: null,
    });
  };

  removeElement = element => {
    let newElements = this.state.newElements;
    newElements = ArrayHelper.removeElementFromArray(newElements, element, 'body');
    this.setState({
      newElements,
    });
  };

  divide = () => {
    const { element, synthesis } = this.props;
    this.hide();
    const data = {
      archived: true,
      published: false,
      division: {
        elements: this.state.newElements,
      },
    };
    SynthesisElementActions.update(synthesis.id, element.id, data);
    hashHistory.push('inbox', { type: 'new' });
  };

  renderOriginalElementPanel = () => {
    const element = this.props.element;
    if (element.body) {
      return (
        <Col
          ref="originalElementPanel"
          xs={12}
          sm={6}
          className="col-height modal__panel panel--original-element">
          <div className="inside inside-full-height box">
            <h2 className="h4 element__title">
              <ElementTitle element={element} link={false} />
            </h2>
            <textarea
              ref="originalText"
              readOnly
              onSelect={this.selectText.bind(null, this)}
              className="element__body selectable"
              value={FormattedText.strip(element.body)}
            />
          </div>
        </Col>
      );
    }
  };

  renderCreateButton = () => {
    if (this.state.selectedText) {
      return (
        <Button
          bsStyle="success"
          className="division__create-element"
          onClick={this.createFromSelection}>
          {<FormattedMessage id="synthesis.edition.action.divide.create_button" />}
        </Button>
      );
    }
    return (
      <OverlayTrigger
        trigger="click"
        rootClose
        placement="bottom"
        overlay={
          <Popover
            id="divide-modal-help-popover"
            title={<FormattedMessage id="synthesis.edition.action.divide.help.title" />}>
            {<FormattedMessage id="synthesis.edition.action.divide.help.message" />}
          </Popover>
        }>
        <Button bsStyle="success" className="division__create-element">
          {<FormattedMessage id="synthesis.edition.action.divide.create_button" />}
        </Button>
      </OverlayTrigger>
    );
  };

  renderNewElements = () => {
    const elements = this.state.newElements;
    if (elements.length) {
      return (
        <ul className="division__elements-list">
          {elements.map((element, index) => {
            return this.renderElement(element, index);
          })}
        </ul>
      );
    }
  };

  renderElement = (element, index) => {
    if (element) {
      return (
        <li key={index} className="division__element">
          <ElementTitle hasLink={false} className="element__title" element={element} />
          <div className="element__body">{FormattedText.strip(element.body)}</div>
          <ElementBreadcrumb element={element} />
          <div className="element__actions">
            <PublishButton element={element} onModal={this.togglePublishModal} />
            <RemoveButton element={element} onRemove={this.removeElement} />
          </div>
        </li>
      );
    }
  };

  renderNewElementsPanel = () => {
    return (
      <Col
        ref="newElementsPanel"
        xs={12}
        sm={6}
        className="col-height modal__panel panel--new-elements">
        <div className="inside inside-full-height box">
          {this.renderCreateButton()}
          {this.renderNewElements()}
        </div>
      </Col>
    );
  };

  renderContent = () => {
    return (
      <Grid fluid>
        <Row>
          <div className="row-height">
            {this.renderOriginalElementPanel()}
            {this.renderNewElementsPanel()}
          </div>
        </Row>
      </Grid>
    );
  };

  renderPublishModal = () => {
    const { synthesis } = this.props;
    const element = this.state.currentElement;
    if (element) {
      return (
        <PublishModal
          synthesis={synthesis}
          element={element}
          show={this.state.showPublishModal}
          toggle={this.togglePublishModal}
          process={this.processPublishedElement}
        />
      );
    }
  };

  render() {
    const { show } = this.props;
    const modalClasses = classNames({
      'modal--divide': true,
      hidden: this.state.showPublishModal,
    });
    return (
      <div>
        <Modal
          bsSize="large"
          show={show}
          onHide={this.hide}
          animation={false}
          dialogClassName={modalClasses}>
          <Modal.Header closeButton>
            <Modal.Title>
              {<FormattedMessage id="synthesis.edition.action.divide.title" />}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>{this.renderContent()}</Modal.Body>
          <Modal.Footer>
            <Button type="button" onClick={this.hide}>
              {<FormattedMessage id="synthesis.edition.action.divide.btn_cancel" />}
            </Button>
            <Button bsStyle="primary" type="submit" onClick={this.divide.bind(null, this)}>
              {<FormattedMessage id="synthesis.edition.action.divide.btn_submit" />}
            </Button>
          </Modal.Footer>
        </Modal>
        {this.renderPublishModal()}
      </div>
    );
  }
}

export default DivideModal;
