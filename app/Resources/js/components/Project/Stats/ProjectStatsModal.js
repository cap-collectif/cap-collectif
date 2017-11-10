import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Modal, ListGroup } from 'react-bootstrap';
import CloseButton from '../../Form/CloseButton';
import ProjectStatsListItem from './ProjectStatsListItem';
import ProjectStatsActions from '../../../actions/ProjectStatsActions';
import Loader from '../../Utils/Loader';

const ProjectStatsModal = React.createClass({
  propTypes: {
    type: React.PropTypes.string.isRequired,
    stepId: React.PropTypes.string.isRequired,
    icon: React.PropTypes.string.isRequired,
    label: React.PropTypes.string.isRequired,
    data: React.PropTypes.object.isRequired,
    showPercentage: React.PropTypes.bool.isRequired,
    isCurrency: React.PropTypes.bool.isRequired,
    theme: React.PropTypes.number.isRequired,
    district: React.PropTypes.number.isRequired,
  },

  getInitialState() {
    const { data } = this.props;
    return {
      showModal: false,
      isLoading: true,
      data,
    };
  },

  componentDidMount() {
    this.loadData();
  },

  componentWillReceiveProps(nextProps) {
    const { district, theme } = this.props;
    if (theme !== nextProps.theme || district !== nextProps.district) {
      this.loadData();
    }
  },

  loadData() {
    const { district, stepId, theme, type } = this.props;
    ProjectStatsActions.load(stepId, type, null, theme, district).then(response => {
      this.setState({
        data: response.data,
        isLoading: false,
      });
    });
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
    const { icon, isCurrency, label, showPercentage, stepId, type } = this.props;
    const id = `project-stats-modal-${stepId}-${type}`;
    return (
      <div>
        <Button
          onClick={this.showModal}
          disabled={this.state.showModal}
          bsStyle="primary"
          className="btn--outline stats__all-button">
          {<FormattedMessage id="project.stats.display.all" />}
        </Button>
        <Modal
          id={`stats-modal-${stepId}-${type}`}
          animation={false}
          show={this.state.showModal}
          onHide={this.hideModal}
          aria-labelledby={`${id}-title`}>
          <Modal.Header closeButton>
            <Modal.Title id={`${id}-title`}>
              <i className={icon} /> {<FormattedMessage id={label} />}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Loader show={this.state.isLoading}>
              <ListGroup className="stats__list">
                {this.state.data.values.length > 0 &&
                  this.state.data.values.map((row, index) => {
                    return (
                      <ProjectStatsListItem
                        key={index}
                        item={row}
                        showPercentage={showPercentage}
                        isCurrency={isCurrency}
                      />
                    );
                  })}
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
