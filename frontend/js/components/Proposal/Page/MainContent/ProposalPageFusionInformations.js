// @flow
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import styled, { type StyledComponent } from 'styled-components';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables';
import { styleGuideColors } from '~/utils/colors';
import type { ProposalPageFusionInformations_proposal } from '~relay/ProposalPageFusionInformations_proposal.graphql';
import { translateContent } from '~/utils/ContentTranslator';
import { bootstrapGrid } from '~/utils/sizes';

type Props = {
  proposal: ?ProposalPageFusionInformations_proposal,
};

const ProposalPageFusionInformationsContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  margin: -15px 15px;

  @media (min-width: ${bootstrapGrid.mdMin}px) {
    margin: 0;
    margin-bottom: 30px;
  }

  > div {
    width: 100%;
    background: #fafcff;
    border: 1px solid #c2dfff;
    box-sizing: border-box;
    ${MAIN_BORDER_RADIUS};
    margin-bottom: 30px;
    padding: 10px;
    font-size: 11px;

    > span {
      font-weight: 600;
      color: ${styleGuideColors.darkBlue};
      display: flex;
      align-items: center;

      svg {
        margin-right: 5px;
      }
    }

    > div {
      margin-left: 17px;
    }
  }
`;

export const ProposalPageFusionInformations = ({ proposal }: Props) => {
  if (!proposal || (!proposal.hasBeenMerged && !proposal.mergedFrom.length)) return null;
  const objectType = proposal.form?.objectType === 'OPINION' ? 'opinion' : 'proposal';
  const title = `${objectType}s.fusionned`;
  const bodyFrom = `new.${objectType}.fusionnedFrom`;
  const bodyInto = `new.${objectType}.fusionnedInto`;
  return (
    <>
      {proposal.mergedFrom.length > 0 && (
        <ProposalPageFusionInformationsContainer>
          <div>
            <span>
              <Icon name={ICON_NAME.information} size={12} color="#1A88FF" />
              <FormattedMessage id={title} />
            </span>
            <div>
              <FormattedMessage id={bodyFrom} values={{ num: proposal.mergedFrom.length }} />
              {proposal.mergedFrom.map(child => (
                <div key={child.id}>
                  - <a href={child.url}>{translateContent(child.title)}</a>
                </div>
              ))}
            </div>
          </div>
        </ProposalPageFusionInformationsContainer>
      )}
      {proposal.mergedIn.length > 0 && (
        <ProposalPageFusionInformationsContainer>
          <div>
            <span>
              <Icon name={ICON_NAME.information} size={12} color="#1A88FF" />
              <FormattedMessage id={title} />
            </span>
            <div>
              <FormattedMessage id={bodyInto} />
              {proposal.mergedIn.map(child => (
                <div key={child.id}>
                  <a href={child.url}>{translateContent(child.title)}</a>
                </div>
              ))}
            </div>
          </div>
        </ProposalPageFusionInformationsContainer>
      )}
    </>
  );
};

export default createFragmentContainer(ProposalPageFusionInformations, {
  proposal: graphql`
    fragment ProposalPageFusionInformations_proposal on Proposal {
      id
      hasBeenMerged
      mergedIn {
        title
        url
        id
      }
      mergedFrom {
        title
        url
        id
      }
      form {
        objectType
      }
    }
  `,
});
