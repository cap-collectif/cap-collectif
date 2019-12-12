// @flow
import * as React from 'react';
import { getCityFromGoogleAddress } from '~/utils/googleMapAddress';
import Tag from '~/components/Ui/Labels/Tag';

type Props = {
  +googleMapsAddress: {
    +json: string,
  },
  size: string,
};

const TagCity = ({ googleMapsAddress, size }: Props) => (
  <Tag icon="cap cap-marker-1" size={size}>
    {getCityFromGoogleAddress(googleMapsAddress)}
  </Tag>
);

export default TagCity;
