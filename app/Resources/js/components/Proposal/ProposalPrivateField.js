// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';

type Props = {
  show: boolean,
  children: React.Node,
  divClassName: string,
};

export class ProposalPrivateField extends React.Component<Props> {
  static defaultProps = {
    show: true,
    children: null,
    divClassName: '',
  };

  render() {
    const { children, show, divClassName } = this.props;
    if (show) {
      return (
        <div>
          <p className="excerpt proposal__private-excerpt">
            <i className="cap cap-lock-2" />
            <FormattedMessage id="global.form.private" />
          </p>
          <div className={`well well-form proposal__private-field ${divClassName}`}>{children}</div>
        </div>
      );
    }

    if (divClassName.length > 0) {
      return <div className={divClassName}>{children}</div>;
    }

    return children;
  }
}

export default ProposalPrivateField;
