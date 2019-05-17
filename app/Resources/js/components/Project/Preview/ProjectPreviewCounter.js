// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';

type Props = {
  value: number,
  label: string,
  showZero?: boolean,
  icon?: string,
};

export class ProjectPreviewCounter extends React.Component<Props> {
  static defaultProps = {
    showZero: false,
  };

  render() {
    const { value, label, showZero, icon } = this.props;
    if (value > 0 || showZero) {
      return (
        <div className="tags-list__tag">
          {icon && <i className={`cap ${icon}`} />}
          {value} <FormattedMessage id={label} values={{ num: value }} />
        </div>
      );
    }
    return null;
  }
}

export default ProjectPreviewCounter;
