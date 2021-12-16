// @flow
import React from 'react';
import { useFragment } from 'relay-hooks';
import { graphql } from 'react-relay';
import styled, { type StyledComponent } from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Skeleton } from '@cap-collectif/ui';
import colors from '~/utils/colors';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import type { ProposalPageTopDonators_proposal$key } from '~relay/ProposalPageTopDonators_proposal.graphql';
import {
  Card,
  CategoryContainer,
  CategoryCircledIcon,
  CategoryTitle,
} from '~/components/Proposal/Page/ProposalPage.style';

type Props = {
  proposal: ?ProposalPageTopDonators_proposal$key,
};

const DonatorRow: StyledComponent<{}, {}, HTMLLIElement> = styled.li`
  display: flex;
  padding: 10px 0 10px 0;
  & *:last-of-type {
    color: ${colors.darkGray};
    margin-left: auto;
  }
`;

const FRAGMENT = graphql`
  fragment ProposalPageTopDonators_proposal on Proposal {
    tipsmeee {
      topDonators {
        name
        amount
        email
      }
    }
  }
`;

export const ProposalPageTopDonators = ({ proposal: proposalFragment }: Props) => {
  const proposal = useFragment(FRAGMENT, proposalFragment);
  if (proposal && !proposal.tipsmeee) return null;
  if (proposal && proposal.tipsmeee.topDonators.length === 0) return null;

  const getTopDonatorName = donator => {
    if (donator.email === 'NOT_FOR_SHARE') {
      return (
        <FormattedMessage id="tipsmeee-anonymous-name">
          {(message: string) => <div className="font-weight-600">{message}</div>}
        </FormattedMessage>
      );
    }
    if (donator.email === 'NOT_PROVIDED') {
      return (
        <FormattedMessage id="tipsmeee-applepay-name">
          {(message: string) => <div className="font-weight-600">{message}</div>}
        </FormattedMessage>
      );
    }
    return <div className="font-weight-600">{donator.name}</div>;
  };

  return (
    <Card>
      <CategoryContainer>
        <CategoryTitle>
          <CategoryCircledIcon>
            <Icon name={ICON_NAME.accounting} size={20} color={colors.secondaryGray} />
          </CategoryCircledIcon>
          <h3>
            <FormattedMessage id="top-donators" />
          </h3>
        </CategoryTitle>
        <Skeleton
          placeholder={<Skeleton.Text width="100%" height="130px" mt={4} ml={4} />}
          isLoaded={proposal !== null}>
          {proposal?.tipsmeee && proposal.tipsmeee.topDonators.length > 0 && (
            <div>
              <ul>
                {proposal?.tipsmeee.topDonators.map((donator, i) => {
                  return (
                    <DonatorRow key={donator.email + i}>
                      {getTopDonatorName(donator)}
                      <div>{donator.amount} €</div>
                    </DonatorRow>
                  );
                })}
              </ul>
            </div>
          )}
        </Skeleton>
      </CategoryContainer>
    </Card>
  );
};

export default ProposalPageTopDonators;
