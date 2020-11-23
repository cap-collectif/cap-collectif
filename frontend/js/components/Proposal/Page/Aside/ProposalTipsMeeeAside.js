// @flow
import * as React from 'react';
import { useFragment } from 'relay-hooks';
import { graphql } from 'react-relay';
import styled, { type StyledComponent } from 'styled-components';
import { FormattedMessage } from 'react-intl';
import type { ProposalTipsMeeeAside_proposal$key } from '~relay/ProposalTipsMeeeAside_proposal.graphql';
import {
  Card,
  ProposalTipsmeeeContainer,
  ProposalTipsmeeeQrCodeContainer,
} from '~/components/Proposal/Page/ProposalPage.style';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';

type Props = {|
  +proposal: ProposalTipsMeeeAside_proposal$key,
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
  fragment ProposalTipsMeeeAside_proposal on Proposal {
    tipsmeee {
      donatorsCount
      donationTotalCount
    }
    title
    tipsmeeeId
  }
`;

const ProposalTipsMeeeAside = ({ proposal: proposalFragment }: Props) => {
  const proposal = useFragment(FRAGMENT, proposalFragment);
  return (
    <>
      {proposal.tipsmeee ? (
        <Card id="ProposalTipsMeeeDonators">
          <Container>
            <Icon name={ICON_NAME.money} size="3rem" />
            <FormattedMessage
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
      <Card id="ProposalTipsmeeeContainer">
        {proposal.tipsmeeeId ? (
          <>
            <ProposalTipsmeeeQrCodeContainer>
              <FormattedMessage id="tipsmeee-qrcode-help" />
              <figure>
                <img
                  src={`https://tipsmeee.fra1.digitaloceanspaces.com/datasStage/qrs/qr_${proposal.tipsmeeeId}.png`}
                  alt="qrcode"
                />
              </figure>
            </ProposalTipsmeeeQrCodeContainer>
            <ProposalTipsmeeeContainer>
              <iframe
                src={`https://www-stage.tipsmeee.com/captips/${proposal.tipsmeeeId}`}
                title={proposal.title}
                width="300"
                height="650"
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
