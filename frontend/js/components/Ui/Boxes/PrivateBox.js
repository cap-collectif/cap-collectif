// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';

type Props = {
  show: boolean,
  children: React.Node,
  divClassName: string,
  message?: string,
};

export class PrivateBox extends React.Component<Props> {
  static defaultProps = {
    show: true,
    children: null,
    divClassName: '',
    message: 'global.private',
  };

  render() {
    const { children, show, divClassName, message } = this.props;
    if (show) {
      return (
        <div>
          <p className="excerpt_private">
            <i className="cap cap-lock-2" />
            {message && <FormattedMessage id={message} />}
          </p>
          <div className={`private-box ${divClassName}`}>{children}</div>
        </div>
      );
    }

    if (divClassName.length > 0) {
      return <div className={divClassName}>{children}</div>;
    }

    return children;
  }
}

export default PrivateBox;
