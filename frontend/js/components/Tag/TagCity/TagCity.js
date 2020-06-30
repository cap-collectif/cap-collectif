// @flow
import * as React from 'react';
import { getCityFromGoogleAddress } from '~/utils/googleMapAddress';
import Tag from '~/components/Ui/Labels/Tag';
import colors from '~/utils/colors';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import IconRounded from '~ui/Icons/IconRounded';

type Props = {
  +googleMapsAddress: {
    +json: string,
  },
  size: string,
};

const TagCity = ({ googleMapsAddress, size }: Props) => (
  <Tag size={size}>
    <IconRounded size={18} color={colors.darkGray}>
      <Icon name={ICON_NAME.pin2} color="#fff" size={10} />
    </IconRounded>

    {getCityFromGoogleAddress(googleMapsAddress)}
  </Tag>
);

export default TagCity;
