// @flow
import * as React from 'react';
import {
  Header,
  ContentContainer,
  PickableHeader,
  Item,
} from './DashboardMailingListPlaceholder.style';
import PickableList from '~ui/List/PickableList';
import ErrorQuery from '~/components/Error/ErrorQuery/ErrorQuery';
import Skeleton from '~ds/Skeleton';

type Props = {|
  hasError: boolean,
  fetchData: ?() => void,
|};

const DashboardMailingListPlaceholder = ({ fetchData, hasError }: Props) => (
  <>
    <Header>
      <Skeleton.Text size="lg" width="250px" bg="white" />
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
                <Skeleton.Text size="md" width="250px" />
                <Skeleton.Text size="md" width="100px" my={2} />
                <Skeleton.Text size="md" width="200px" />
              </Item>
            ))
          )}
        </ContentContainer>
      </PickableList.Body>
    </PickableList>
  </>
);

export default DashboardMailingListPlaceholder;
