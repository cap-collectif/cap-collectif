import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Button } from 'react-bootstrap';
import OpinionEditModal from './Edit/OpinionEditModal';

const OpinionEditButton = React.createClass({
  propTypes: {
    opinion: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      modal: false,
    };
  },

  openModal() {
    this.setState({ modal: true });
  },

  closeModal() {
    this.setState({ modal: false });
  },

  render() {
    const { opinion } = this.props;
    return (
      <span>
        <Button className="opinion__action--edit pull-right btn--outline btn-dark-gray" onClick={this.openModal}>
          <i className="cap cap-pencil-1"></i> {this.getIntlMessage('global.edit')}
        </Button>
        { ' ' }
        <OpinionEditModal
          opinion={opinion}
          show={this.state.modal}
          onClose={this.closeModal}
        />
      </span>
    );
  },

});

export default OpinionEditButton;
