// @flow
import * as React from 'react';
import { useFragment } from 'relay-hooks';
import { graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import styled, { type StyledComponent } from 'styled-components';
import type { ProposalTipsMeeeAside_proposal$key } from '~relay/ProposalTipsMeeeAside_proposal.graphql';
import {
  Card,
  ProposalTipsmeeeContainer,
  ProposalTipsmeeeQrCodeContainer,
} from '~/components/Proposal/Page/ProposalPage.style';
import config from '~/config';
import ProposalTipsMeeeDonatorsAside from '~/components/Proposal/Page/Aside/ProposalTipsMeeeDonatorsAside';
import { mediaQueryMobile } from '~/utils/sizes';

type Props = {|
  +proposal: ProposalTipsMeeeAside_proposal$key,
|};

const FRAGMENT = graphql`
  fragment ProposalTipsMeeeAside_proposal on Proposal {
    ...ProposalTipsMeeeDonatorsAside_proposal
    title
    tipsmeeeId
  }
`;

const AsideDonator: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    display: none;
  }
  @media (min-width: ${mediaQueryMobile.maxWidth}) {
    display: flex;
    #ProposalTipsMeeeDonators {
      width: 100%;
    }
  }
`;

const ProposalTipsMeeeAside = ({ proposal: proposalFragment }: Props) => {
  const proposal = useFragment(FRAGMENT, proposalFragment);
  return (
    <>
      <AsideDonator>
        <ProposalTipsMeeeDonatorsAside proposal={proposal} />
      </AsideDonator>
      <Card id="ProposalTipsmeeeContainer">
        {proposal.tipsmeeeId ? (
          <>
            <ProposalTipsmeeeQrCodeContainer>
              <FormattedMessage id="tipsmeee-qrcode-help" />
              <figure>
                <img
                  src={
                    config.isDevOrTest
                      ? `https://tipsmeee.fra1.digitaloceanspaces.com/datasStage/qrs/qr_${proposal.tipsmeeeId}.png`
                      : `https://tipsmeee.fra1.digitaloceanspaces.com/datas/qrs/qr_${proposal.tipsmeeeId}.png`
                  }
                  alt="qrcode"
                />
              </figure>
            </ProposalTipsmeeeQrCodeContainer>
            <ProposalTipsmeeeContainer>
              <iframe
                scrolling="no"
                src={
                  config.isDevOrTest
                    ? `https://www-stage.tipsmeee.com/captips/${proposal.tipsmeeeId}`
                    : `https://tipsmeee.com/captips/${proposal.tipsmeeeId}`
                }
                title={proposal.title}
                height="560"
              />
            </ProposalTipsmeeeContainer>
          </>
        ) : (
          <>
            <ProposalTipsmeeeQrCodeContainer>
              <b>
                <FormattedMessage id="establishment-not-ready" />
              </b>
            </ProposalTipsmeeeQrCodeContainer>
          </>
        )}
      </Card>
    </>
  );
};

export default ProposalTipsMeeeAside;
