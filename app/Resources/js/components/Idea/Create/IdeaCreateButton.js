import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import LoginOverlay from '../../Utils/LoginOverlay';

export const IdeaCreateButton = React.createClass({
  propTypes: {
    handleClick: PropTypes.func.isRequired
  },

  render() {
    const { handleClick } = this.props;
    return (
      <LoginOverlay>
        <Button
          id="idea-create-button"
          bsStyle="primary"
          onClick={handleClick}
          className="form-control">
          <i className="cap cap-add-1" />
          <FormattedMessage id="idea.add" />
        </Button>
      </LoginOverlay>
    );
  }
});

export default IdeaCreateButton;
