// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import Tag from '../../Ui/Labels/Tag';
import { formatBigNumber } from '../../../utils/bigNumberFormatter';

type Props = {|
  +value: number,
  +label: string,
  +showZero?: boolean,
  +icon?: string,
|};

export class ProjectPreviewCounter extends React.Component<Props> {
  static defaultProps = {
    showZero: false,
  };

  render() {
    const { value, label, showZero, icon } = this.props;
    if (value > 0 || showZero) {
      const formattedValue = formatBigNumber(value);
      return (
        <Tag icon={icon ? `cap ${icon}` : undefined}>
          {formattedValue} <FormattedMessage id={label} values={{ num: `${value}` }} />
        </Tag>
      );
    }
    return null;
  }
}

export default ProjectPreviewCounter;
