// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';

type Props = {
  visible?: boolean,
  expanded?: boolean,
  onClick: Function,
};

class ReadMoreLink extends React.Component<Props> {
  static displayName = 'ReadMoreLink';

  static defaultProps = {
    visible: false,
    expanded: false,
  };

  render() {
    const { expanded, onClick, visible } = this.props;
    if (!visible) {
      return null;
    }
    return (
      <Button bsStyle="link" className="btn-block read-more__button" onClick={onClick}>
        {expanded ? (
          <>
            <FormattedMessage id="global.read_less" /> <i className="ml-5 cap cap-arrow-68" />
          </>
        ) : (
          <>
            <FormattedMessage id="global.read_more" /> <i className="ml-5 cap cap-arrow-67" />
          </>
        )}
      </Button>
    );
  }
}

export default ReadMoreLink;
