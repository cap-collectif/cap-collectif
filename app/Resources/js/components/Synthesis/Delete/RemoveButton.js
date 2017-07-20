import React from 'react';
import { IntlMixin } from 'react-intl';
import { Button } from 'react-bootstrap';

const RemoveButton = React.createClass({
  propTypes: {
    element: React.PropTypes.object,
    onRemove: React.PropTypes.func,
  },
  mixins: [IntlMixin],

  click() {
    const {
      element,
      onRemove,
    } = this.props;
    onRemove(element);
  },

  render() {
    return (
      <div className="element__action">
        <Button bsSize="large" type="button" className="element__action-remove" onClick={this.click.bind(null, this)}><i className="cap cap-delete-1-1"></i></Button>
      </div>
    );
  },

});

export default RemoveButton;
