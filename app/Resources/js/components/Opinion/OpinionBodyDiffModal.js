import CustomDiff from '../../services/CustomDiff';

const Modal = ReactBootstrap.Modal;
const Button = ReactBootstrap.Button;
const OverlayTrigger = ReactBootstrap.OverlayTrigger;
const Tooltip = ReactBootstrap.Tooltip;

const OpinionBodyDiffModal = React.createClass({
  propTypes: {
    link: React.PropTypes.string.isRequired,
    modal: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return { showModal: false };
  },

  open() {
    this.setState({ showModal: true });
  },

  close() {
    this.setState({ showModal: false });
  },

  render() {
    return (
      <span>
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip placement="top" className="in">
              {this.getIntlMessage('opinion.diff.tooltip')}
            </Tooltip>
          }
        >
          <a onClick={() => this.open()}>
            {this.props.link}
          </a>
        </OverlayTrigger>
        <Modal show={this.state.showModal} onHide={() => this.close()}>
          <Modal.Header closeButton>
            <Modal.Title>{this.props.modal.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <b>{this.getIntlMessage('opinion.diff.title')}</b>
            <p className="small excerpt">{this.getIntlMessage('opinion.diff.infos')}</p>
            <div dangerouslySetInnerHTML={{__html: CustomDiff.prettyDiff(this.props.modal.before, this.props.modal.after) }} />
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="primary" onClick={() => this.close()}>{this.getIntlMessage('global.close')}</Button>
          </Modal.Footer>
        </Modal>
      </span>
    );
  },

});

export default OpinionBodyDiffModal;
