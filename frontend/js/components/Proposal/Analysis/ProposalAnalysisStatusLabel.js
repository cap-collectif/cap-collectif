// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Label from '~/components/Ui/Labels/Label';
import colors from '~/utils/colors';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';

type Props = {|
  color: string,
  fontSize: number,
  iconSize: number,
  iconName: string,
  text: string,
|};

export const ProposalAnalysisStatusLabel = ({
  text,
  color,
  fontSize,
  iconSize,
  iconName,
}: Props) => (
  <Label color={color} fontSize={fontSize}>
    <Icon name={ICON_NAME[iconName]} size={iconSize} color={colors.white} />
    <span className="ml-5">
      <FormattedMessage id={text} />
    </span>
  </Label>
);

export default ProposalAnalysisStatusLabel;
