import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import ElementsList from './../List/ElementsList';
import Loader from '../../Ui/FeedbacksIndicators/Loader';

class ChildrenModal extends React.Component {
  static propTypes = {
    elements: PropTypes.array.isRequired,
    show: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    const { elements } = props;

    this.state = {
      isLoading: elements.length === 0,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      isLoading: nextProps.elements.length === 0,
    });
  }

  show = () => {
    const { toggle } = this.props;
    toggle(true);
  };

  hide = () => {
    const { toggle } = this.props;
    toggle(false);
  };

  render() {
    const { elements, show } = this.props;
    return (
      <Modal show={show} onHide={this.hide} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>{<FormattedMessage id='global.contribution' />}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Loader show={this.state.isLoading}>
            <ElementsList
              elements={elements}
              showBreadcrumb={false}
              showStatus={false}
              showNotation={false}
              hasLink
              linkType="original"
            />
          </Loader>
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" bsStyle="primary" onClick={this.hide}>
            {<FormattedMessage id='global.close' />}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default ChildrenModal;
