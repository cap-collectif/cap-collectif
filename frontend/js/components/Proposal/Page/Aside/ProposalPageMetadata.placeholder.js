// @flow
import * as React from 'react';
import ReactPlaceholder from 'react-placeholder';
import colors from '~/utils/colors';

export const MetadataPlaceHolder = ({
  ready,
  children,
}: {
  ready: boolean,
  children: React.Node,
}) => (
  <ReactPlaceholder
    type="textRow"
    style={{
      marginTop: 3,
      marginLeft: 10,
      width: 150,
      height: 12,
    }}
    showLoadingAnimation
    color={colors.borderColor}
    ready={ready}>
    {children}
  </ReactPlaceholder>
);
