import React from 'react';
import {IntlMixin} from 'react-intl';
import {Button, Modal, ListGroup} from 'react-bootstrap';
import CloseButton from '../../Form/CloseButton';
import ProjectStatsListItem from './ProjectStatsListItem';
import ProjectStatsActions from '../../../actions/ProjectStatsActions';
import Loader from '../../Utils/Loader';

const ProjectStatsModal = React.createClass({
  propTypes: {
    type: React.PropTypes.string.isRequired,
    stepId: React.PropTypes.number.isRequired,
    icon: React.PropTypes.string.isRequired,
    label: React.PropTypes.string.isRequired,
    data: React.PropTypes.object.isRequired,
    showPercentage: React.PropTypes.bool.isRequired,
    isCurrency: React.PropTypes.bool.isRequired,
    theme: React.PropTypes.number.isRequired,
    district: React.PropTypes.number.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      showModal: false,
      isLoading: true,
      data: this.props.data,
    };
  },

  componentWillMount() {
    this.loadData();
  },

  componentWillReceiveProps(nextProps) {
    if (this.props.theme !== nextProps.theme || this.props.district !== nextProps.district) {
      this.loadData();
    }
  },

  loadData() {
    ProjectStatsActions.load(
      this.props.stepId,
      this.props.type,
      null,
      this.props.theme,
      this.props.district
    )
      .then((response) => {
        this.setState({
          data: response.data,
          isLoading: false,
        });
      })
    ;
  },

  showModal() {
    this.setState({
      showModal: true,
    });
  },

  hideModal() {
    this.setState({
      showModal: false,
    });
  },

  render() {
    const id = 'project-stats-modal-' + this.props.stepId + '-' + this.props.type;
    return (
      <div>
        <Button
          onClick={this.showModal}
          disabled={this.state.showModal}
          bsStyle="primary"
          className="btn--outline stats__all-button"
        >
          {this.getIntlMessage('project.stats.display.all')}
        </Button>
        <Modal
          animation={false}
          show={this.state.showModal}
          onHide={this.hideModal}
          bsSize="medium"
          aria-labelledby={id + '-title'}
        >
          <Modal.Header closeButton>
            <Modal.Title id={id + '-title'}>
              <i className={this.props.icon}></i> {this.getIntlMessage(this.props.label)}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Loader show={this.state.isLoading}>
              <ListGroup className="stats__list">
                {
                  this.state.data.values.map((row, index) => {
                    return (
                      <ProjectStatsListItem
                        key={index}
                        item={row}
                        showPercentage={this.props.showPercentage}
                        isCurrency={this.props.isCurrency}
                      />
                    );
                  })
                }
              </ListGroup>
            </Loader>
          </Modal.Body>
          <Modal.Footer>
            <CloseButton onClose={this.hideModal} label="project.stats.modal.close" />
          </Modal.Footer>
        </Modal>
      </div>
    );
  },

});

export default ProjectStatsModal;
