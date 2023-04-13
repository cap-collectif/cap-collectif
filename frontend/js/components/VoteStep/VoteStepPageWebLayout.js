// @flow
import { Box, Flex } from '@cap-collectif/ui';
import * as React from 'react';
import VoteStepMapQuery from './Map/VoteStepMapQuery';
import ViewChangePanel, { type VIEW } from './ViewChangePanel';

type Props = {|
  +stepId: string,
  +setLatlng: string => void,
  +latlng: string,
|};

export const VoteStepPageWebLayout = ({ stepId, setLatlng, latlng }: Props) => {
  const [view, setView] = React.useState<VIEW>('list');

  return (
    <Flex>
      <Box width="20%" bg="gray.100">
        TODO filtres/vue votes
      </Box>
      <Box width={view === 'card' ? '40%' : '80%'} bg="gray.100" pt={6} px={8}>
        <Flex
          justify="space-between"
          alignItems="center"
          width={view === 'card' ? '100%' : '50%'}
          pr={view === 'card' ? 0 : 8}>
          <Box>TODO Search bar</Box>
          <ViewChangePanel view={view} setView={setView} />
        </Flex>
        <Box>TODO vue centrale {latlng}</Box>
      </Box>
      {view === 'card' ? (
        <Box width="40%">
          <React.Suspense fallback="ui">
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
