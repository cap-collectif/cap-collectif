// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { TextRow } from 'react-placeholder/lib/placeholders';
import PickableList from '~ui/List/PickableList/index';
import colors from '~/utils/colors';
import { blink } from '~/utils/styles/keyframes';

type Props = {|
  +headerContent?: React.Node,
  +rowsCount?: number,
|};

const PlaceholderPickableList: StyledComponent<{}, {}, typeof PickableList> = styled(PickableList)`
  animation: ${blink} 0.6s linear infinite alternate;
`;

export const PickableListPlaceholder = ({ headerContent, rowsCount = 10 }: Props) => {
  const rows = Array(rowsCount).fill(null);
  return (
    <PlaceholderPickableList>
      <PickableList.Header isSelectable={false}>
        <p style={{ margin: 0 }}>{headerContent ?? <span>&nbsp;</span>}</p>
      </PickableList.Header>
      <PickableList.Body>
        {rows.map((row, i) => (
          <PickableList.Row isSelectable={false} key={i} rowId={i}>
            <TextRow color={colors.borderColor} style={{ width: 200, height: 16, margin: 0 }} />
          </PickableList.Row>
        ))}
      </PickableList.Body>
    </PlaceholderPickableList>
  );
};

export default PickableListPlaceholder;
