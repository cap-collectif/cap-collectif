// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { type StyledComponent } from 'styled-components';
import { graphql } from 'react-relay';
import { useFragment } from 'relay-hooks';
import moment from 'moment';
import type { ProposalPageDonators_proposal$key } from '~relay/ProposalPageDonators_proposal.graphql';
import { CategoryTitle } from '~/components/Proposal/Page/ProposalPage.style';
import Card from '~ui/Card/Card';
import { DATE_LONG_LOCALIZED_FORMAT } from '~/shared/date';
import { styleGuideColors } from '~/utils/colors';

type Props = {|
  proposal: ?ProposalPageDonators_proposal$key,
|};

const ProposalPageDonatorsContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  width: 100%;
  max-width: 950px;
  margin: auto;
  padding: 10px;

  .CategoryTitle {
    margin-bottom: 20px;
  }
`;

const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(212px, 1fr));
  gap: 2rem;
`;

const DonationDate: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  font-size: 11px;
  line-height: 16px;
  color: ${styleGuideColors.gray500};
  font-weight: 400;
`;

const DonationAmount: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${styleGuideColors.gray500};
  line-height: 24px;
`;

const FRAGMENT = graphql`
  fragment ProposalPageDonators_proposal on Proposal {
    title
    tipsmeee {
      donatorsCount
      topDonators {
        name
        amount
        date
        email
      }
    }
  }
`;

export const ProposalPageDonators = ({ proposal: proposalFragment }: Props) => {
  const proposal = useFragment(FRAGMENT, proposalFragment);
  if (proposal && !proposal.tipsmeee) return null;

  const getTopDonatorName = donator => {
    if (donator.email === 'NOT_FOR_SHARE') {
      return (
        <FormattedMessage id="tipsmeee-anonymous-name">
          {(message: string) => <p className="font-weight-bold">{message}</p>}
        </FormattedMessage>
      );
    }
    if (donator.email === 'NOT_PROVIDED') {
      return (
        <FormattedMessage id="tipsmeee-applepay-name">
          {(message: string) => <p className="font-weight-bold">{message}</p>}
        </FormattedMessage>
      );
    }
    return <p className="font-weight-bold">{donator.name}</p>;
  };

  return (
    <ProposalPageDonatorsContainer>
      <CategoryTitle>
        <h3>
          <FormattedMessage values={{ title: proposal?.title }} id="proposal.donators.thanks" />
        </h3>
      </CategoryTitle>

      {proposal?.tipsmeee.topDonators.length !== 0 ? (
        <Container>
          {proposal?.tipsmeee.topDonators.map(donator => (
            <Card>
              <Card.Body>
                {getTopDonatorName(donator)}
                <DonationDate>
                  {moment(donator.date).format(DATE_LONG_LOCALIZED_FORMAT)}
                </DonationDate>
                <DonationAmount>{donator.amount} €</DonationAmount>
              </Card.Body>
            </Card>
          ))}
        </Container>
      ) : (
        <div className="well well-lg text-center">
          <i className="cap-32 cap-contacts-1 " />
          <br />
          <FormattedMessage id="no-donators" />
        </div>
      )}
    </ProposalPageDonatorsContainer>
  );
};

export default ProposalPageDonators;
