// @flow
import * as React from 'react';
import { TextRow } from 'react-placeholder/lib/placeholders';
import {
  Header,
  ContentContainer,
  PickableHeader,
  Item,
} from './DashboardMailingListPlaceholder.style';
import PickableList from '~ui/List/PickableList';
import ErrorQuery from '~/components/Error/ErrorQuery/ErrorQuery';
import colors from '~/utils/colors';

type Props = {|
  hasError: boolean,
  fetchData: ?() => void,
|};

const DashboardMailingListPlaceholder = ({ fetchData, hasError }: Props) => (
  <>
    <Header>
      <TextRow color="#fff" style={{ width: 250, height: 30 }} />
    </Header>

    <PickableList>
      <PickableHeader disabled isSelectable={false} />

      <PickableList.Body>
        <ContentContainer>
          {hasError ? (
            <ErrorQuery retry={fetchData} />
          ) : (
            new Array(5).fill(null).map((value, idx) => (
              <Item key={idx}>
                <TextRow
                  color={colors.borderColor}
                  style={{ width: 250, height: 15, marginBottom: 0, marginTop: 0 }}
                />
                <TextRow
                  color={colors.borderColor}
                  style={{ width: 100, height: 15, marginBottom: 8, marginTop: 8 }}
                />
                <TextRow
                  color={colors.borderColor}
                  style={{ width: 200, height: 15, marginBottom: 0, marginTop: 0 }}
                />
              </Item>
            ))
          )}
        </ContentContainer>
      </PickableList.Body>
    </PickableList>
  </>
);

export default DashboardMailingListPlaceholder;
