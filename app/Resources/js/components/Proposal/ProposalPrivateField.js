import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

const ProposalPrivateField = React.createClass({
  propTypes: {
    show: PropTypes.bool,
    children: PropTypes.node,
    divClassName: PropTypes.string,
  },

  getDefaultProps() {
    return {
      show: true,
      children: null,
      divClassName: '',
    };
  },

  render() {
    const { children, show, divClassName } = this.props;
    if (show) {
      return (
        <div>
          <p className="excerpt small">
            <i className="cap cap-lock-2" />
            {<FormattedMessage id="global.form.private" />}
          </p>
          <div className={`well well-form proposal__private-field ${divClassName}`}>{children}</div>
        </div>
      );
    }

    if (divClassName.length > 0) {
      return <div className={divClassName}>{children}</div>;
    }

    return children;
  },
});

export default ProposalPrivateField;
