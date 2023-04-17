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

const BACKGROUND_COLOR = '#FAF4E6';

export const VoteStepPageMobileLayout = ({ stepId, setLatlng, latlng, isMapView }: Props) => {
  const [view, setView] = React.useState<VIEW>(isMapView ? 'card' : 'list');

  return (
    <Flex>
      <ViewChangePanel view={view} setView={setView} isMobile />
      {view === 'card' ? (
        <React.Suspense fallback="ui">
          <VoteStepMapQuery
            stepId={stepId}
            handleMapPositionChange={(newLatlng: string) => {
              setLatlng(newLatlng);
            }}
            defaultCenter={latlng ? JSON.parse(latlng) : null}
          />
        </React.Suspense>
      ) : null}
      {view === 'list' ? (
        <Box bg={BACKGROUND_COLOR} width="100%" height="100vh">
          <React.Suspense fallback={<ProposalsListSkeleton />}>
            <ProposalsList stepId={stepId} showImages={false} />
          </React.Suspense>
        </Box>
      ) : null}
      {view === 'votes' ? (
        <Box bg={BACKGROUND_COLOR} width="100%" height="100vh">
          Votes view
        </Box>
      ) : null}
    </Flex>
  );
};

export default VoteStepPageMobileLayout;
