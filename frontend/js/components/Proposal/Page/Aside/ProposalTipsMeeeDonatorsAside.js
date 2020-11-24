// @flow
import * as React from 'react';
import { useFragment } from 'relay-hooks';
import { graphql } from 'react-relay';
import styled, { type StyledComponent } from 'styled-components';
import { FormattedHTMLMessage } from 'react-intl';
import type { ProposalTipsMeeeDonatorsAside_proposal$key } from '~relay/ProposalTipsMeeeDonatorsAside_proposal.graphql';
import { Card } from '~/components/Proposal/Page/ProposalPage.style';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';

type Props = {|
  +proposal: ProposalTipsMeeeDonatorsAside_proposal$key,
|};

const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  padding: 20px;
  & p {
    margin: 0;
  }
  & svg {
    margin-right: 8px;
    position: relative;
    top: -4px;
  }
`;

const FRAGMENT = graphql`
  fragment ProposalTipsMeeeDonatorsAside_proposal on Proposal {
    tipsmeee {
      donatorsCount
      donationTotalCount
    }
  }
`;

const ProposalTipsMeeeDonatorsAside = ({ proposal: proposalFragment }: Props) => {
  const proposal = useFragment(FRAGMENT, proposalFragment);
  return (
    <>
      {proposal.tipsmeee ? (
        <Card id="ProposalTipsMeeeDonators">
          <Container>
            <Icon name={ICON_NAME.money} size="3rem" />
            <FormattedHTMLMessage
              tagName="p"
              id="money-collected-by"
              values={{
                amount: proposal.tipsmeee.donationTotalCount,
                donatorsCount: proposal.tipsmeee.donatorsCount,
              }}
            />
          </Container>
        </Card>
      ) : null}
    </>
  );
};

export default ProposalTipsMeeeDonatorsAside;
