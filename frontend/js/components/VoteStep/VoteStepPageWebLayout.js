// @flow
import { Box, Flex } from '@cap-collectif/ui';
import * as React from 'react';
import VoteStepMapQuery from './Map/VoteStepMapQuery';
import ViewChangePanel, { type VIEW } from './ViewChangePanel';
import ProposalsList from './List/ProposalsList';
import ProposalsListSkeleton from './List/ProposalsListSkeleton';

type Props = {|
  +stepId: string,
  +setLatlng: string => void,
  +latlng: string,
  +isMapView: boolean,
|};

export const VoteStepPageWebLayout = ({ stepId, setLatlng, latlng, isMapView }: Props) => {
  const [view, setView] = React.useState<VIEW>(isMapView ? 'card' : 'list');

  return (
    <Flex>
      <Box width="20%" bg="gray.100">
        TODO filtres/vue votes
      </Box>
      <Box width={view === 'card' ? '40%' : '80%'} bg="gray.100" pt={6}>
        <Flex
          justify="space-between"
          alignItems="center"
          width={view === 'card' ? '100%' : '50%'}
          px={8}
          mb={6}>
          <Box>TODO Search bar</Box>
          <ViewChangePanel view={view} setView={setView} />
        </Flex>
        <React.Suspense fallback={<ProposalsListSkeleton showImages={view !== 'card'} />}>
          <ProposalsList stepId={stepId} showImages={view !== 'card'} />
        </React.Suspense>
      </Box>
      {view === 'card' ? (
        <Box width="40%">
          <React.Suspense fallback="TODO : skeleton">
            <VoteStepMapQuery
              stepId={stepId}
              handleMapPositionChange={(newLatlng: string) => {
                setLatlng(newLatlng);
              }}
              defaultCenter={latlng ? JSON.parse(latlng) : null}
            />
          </React.Suspense>
        </Box>
      ) : null}
    </Flex>
  );
};

export default VoteStepPageWebLayout;
