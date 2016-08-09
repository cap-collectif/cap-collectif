import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import LoginOverlay from '../../Utils/LoginOverlay';
import { Button } from 'react-bootstrap';

export const IdeaCreateButton = React.createClass({
  propTypes: {
    handleClick: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { handleClick } = this.props;
    return (
      <LoginOverlay>
        <Button
          id="idea-create-button"
          bsStyle="primary"
          onClick={handleClick}
          className="form-control"
        >
          <i className="cap cap-add-1"></i>
          { ` ${this.getIntlMessage('idea.add')}`}
        </Button>
      </LoginOverlay>
    );
  },

});

export default IdeaCreateButton;
