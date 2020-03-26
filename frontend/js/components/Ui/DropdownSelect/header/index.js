// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';

const DropdownSelectHeaderContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  padding: 10px;
  background: ${colors.pageBgc};
  border-bottom: 1px solid ${colors.lightGray};
  position: sticky;
  z-index: 10;
  top: 40px;
`;

const DropdownSelectHeader = ({ children }: { children: React.Node }) => {
  return <DropdownSelectHeaderContainer>{children}</DropdownSelectHeaderContainer>;
};

DropdownSelectHeader.displayName = 'DropdownSelect.Header';

export default DropdownSelectHeader;
