import SynthesisElementActions from '../../actions/SynthesisElementActions';

import ArrayHelper from '../../services/ArrayHelper';
import FormattedText from '../../services/FormattedText';

import ElementTitle from './ElementTitle';
import ElementBreadcrumb from './ElementBreadcrumb';

import PublishButton from './PublishButton';
import RemoveButton from './RemoveButton';

import PublishModal from './PublishModal';

const Button = ReactBootstrap.Button;
const Modal = ReactBootstrap.Modal;
const Grid = ReactBootstrap.Grid;
const Row = ReactBootstrap.Row;
const Col = ReactBootstrap.Col;
const OverlayTrigger = ReactBootstrap.OverlayTrigger;
const Popover = ReactBootstrap.Popover;

const DivideModal = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
    element: React.PropTypes.object,
    show: React.PropTypes.bool,
    toggle: React.PropTypes.func,
  },
  mixins: [ReactIntl.IntlMixin, ReactRouter.Navigation],

  getInitialState() {
    return {
      newElements: this.props.element.division ? this.props.element.division.elements : [],
      currentElement: null,
      showPublishModal: false,
      selectedText: null,
    };
  },

  componentDidUpdate() {
    autosize(React.findDOMNode(this.refs.originalText));
  },

  componentWillUnmount() {
    autosize.destroy(React.findDOMNode(this.refs.originalText));
    this.togglePublishModal(false);
  },

  getSelectedText(obj) {
    if (typeof obj !== 'undefined') {
      const start = obj.selectionStart;
      const end = obj.selectionEnd;
      if (start !== end) {
        return obj.value.substring(start, end);
      }
      return null;
    }
    return null;
  },

  renderOriginalElementPanel() {
    const element = this.props.element;
    if (element.body) {
      return (
        <Col ref="originalElementPanel" xs={12} sm={6} className="col-height modal__panel panel--original-element">
          <div className="inside inside-full-height box">
            <h2 className="h4 element__title"><ElementTitle element={element} link={false} /></h2>
            <textarea ref="originalText" readOnly onSelect={this.selectText.bind(null, this)} className="element__body selectable" value={FormattedText.strip(element.body)} ></textarea>
          </div>
        </Col>
      );
    }
  },

  renderCreateButton() {
    if (this.state.selectedText) {
      return <Button bsStyle="success" className="division__create-element" onClick={this.createFromSelection.bind(null, this)}>{this.getIntlMessage('edition.action.divide.create_button')}</Button>;
    }
    return (
      <OverlayTrigger trigger="click" rootClose placement="bottom" overlay={<Popover title={this.getIntlMessage('edition.action.divide.help.title')}>{this.getIntlMessage('edition.action.divide.help.message')}</Popover>}>
        <Button bsStyle="success" className="division__create-element">{this.getIntlMessage('edition.action.divide.create_button')}</Button>
      </OverlayTrigger>
    );
  },

  renderNewElements() {
    const elements = this.state.newElements;
    if (elements.length) {
      return (
        <ul className="division__elements-list">
          {
            elements.map((element) => {
              return this.renderElement(element);
            })
          }
        </ul>
      );
    }
  },

  renderElement(element) {
    if (element) {
      return (
        <li className="division__element">
          <ElementTitle link={false} className="element__title" element={element} />
          <div className="element__body">
            {FormattedText.strip(element.body)}
          </div>
          <ElementBreadcrumb element={element} />
          <div className="element__actions">
            <PublishButton element={element} onModal={this.togglePublishModal} />
            <RemoveButton element={element} onRemove={this.removeElement} />
          </div>
        </li>
      );
    }
  },

  renderNewElementsPanel() {
    return (
      <Col ref="newElementsPanel" xs={12} sm={6} className="col-height modal__panel panel--new-elements">
        <div className="inside inside-full-height box">
          {this.renderCreateButton()}
          {this.renderNewElements()}
        </div>
      </Col>
    );
  },

  renderContent() {
    return (
      <Grid fluid={true}>
        <Row>
          <div className="row-height">
            {this.renderOriginalElementPanel()}
            {this.renderNewElementsPanel()}
          </div>
        </Row>
      </Grid>
    );
  },

  renderPublishModal() {
    const element = this.state.currentElement;
    return (
      <PublishModal synthesis={this.props.synthesis} element={element} show={this.state.showPublishModal} toggle={this.togglePublishModal} process={this.processPublishedElement} />
    );
  },

  render() {
    const modalClasses = classNames({
      'modal--divide': true,
      'hidden': this.state.showPublishModal,
    });
    return (
      <div>
        <Modal bsSize="large" show={this.props.show} onHide={this.hide} animation={false} dialogClassName={modalClasses}>
          <Modal.Header closeButton>
            <Modal.Title>{this.getIntlMessage('edition.action.divide.title')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.renderContent()}
          </Modal.Body>
          <Modal.Footer>
            <Button type="button" onClick={this.hide.bind(null, this)}>{this.getIntlMessage('edition.action.divide.btn_cancel')}</Button>
            <Button bsStyle="primary" type="submit" onClick={this.divide.bind(null, this)}>{this.getIntlMessage('edition.action.divide.btn_submit')}</Button>
          </Modal.Footer>
        </Modal>
        {this.renderPublishModal()}
      </div>
    );
  },

  show() {
    this.props.toggle(true);
  },

  hide() {
    this.props.toggle(false);
  },

  togglePublishModal(value, element) {
    this.setState({
      currentElement: element,
      showPublishModal: value,
    });
  },

  selectText() {
    const selectedText = this.getSelectedText(React.findDOMNode(this.refs.originalText));
    this.setState({
      selectedText: selectedText,
    });
  },

  createFromSelection() {
    const body = this.state.selectedText;
    if (body && body !== '') {
      const newElement = {
        'title': null,
        'body': body,
        'archived': false,
        'published': false,
        'parent': this.props.element.parent,
      };
      this.addElement(newElement);
      this.togglePublishModal(true, newElement);
    }
  },

  processPublishedElement(element) {
    this.removeElement(element);
    this.addElement(element);
  },

  addElement(element) {
    let newElements = this.state.newElements;
    newElements = ArrayHelper.addElementToArray(newElements, element, 'body');
    this.setState({
      newElements: newElements,
      selectedText: null,
    });
  },

  removeElement(element) {
    const newElements = this.state.newElements;
    ArrayHelper.removeElementFromArray(newElements, element, 'body');
    this.setState({
      newElements: newElements,
    });
  },

  divide() {
    this.hide();
    const data = {
      'archived': true,
      'published': false,
      'division': {
        'elements': this.state.newElements,
      },
    };
    SynthesisElementActions.archive(this.props.synthesis.id, this.props.element.id, data);
    this.transitionTo('inbox', {'type': 'new'});
  },

});

export default DivideModal;
