// @flow
import * as React from 'react';
import styled, { type StyledComponent, css } from 'styled-components';
import { graphql, createFragmentContainer } from 'react-relay';
import ReactPlaceholder from 'react-placeholder';
import { FormattedNumber } from 'react-intl';
import colors from '~/utils/colors';
import ProposalDetailLikers from '../../Detail/ProposalDetailLikers';
import type { ProposalPageMetadata_proposal } from '~relay/ProposalPageMetadata_proposal.graphql';
import { Card, CategoryCircledIcon } from '~/components/Proposal/Page/ProposalPage.style';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';

const ProposalPageMetadataContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  padding: 20px;

  > div {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
  }

  > div > span {
    margin-left: 10px;
    max-width: 225px;
  }
`;

const Element: StyledComponent<{ iconOnly?: boolean }, {}, HTMLDivElement> = styled.div`
  display: flex;
  font-size: 16px;
  color: ${colors.darkText};
  ${({ iconOnly }) =>
    iconOnly &&
    css`
      margin-left: 5px;

      span {
        margin-left: 5px;
      }

      div {
        margin-left: 15px !important;
      }
    `}
`;

export const MetadataPlaceHolder = ({
  ready,
  children,
}: {
  ready: boolean,
  children: React.Node,
}) => (
  <ReactPlaceholder
    type="textRow"
    style={{
      marginTop: 3,
      marginLeft: 10,
      width: 150,
      height: 12,
    }}
    showLoadingAnimation
    color={colors.borderColor}
    ready={ready}>
    {children}
  </ReactPlaceholder>
);

type Props = {
  proposal: ProposalPageMetadata_proposal,
  showCategories: boolean,
  showDistricts: boolean,
  showNullEstimation: boolean,
  showThemes: boolean,
};

export const MetadataRow = ({
  name,
  size,
  ready,
  color,
  content,
  categorySize = 24,
  categoryPaddingTop = 0,
  categoryPaddingLeft = 7,
}: {
  name: $Values<typeof ICON_NAME>,
  size: number,
  ready: boolean,
  color: string,
  content: string | React.Element<typeof FormattedNumber>,
  categorySize?: number,
  categoryPaddingTop?: number,
  categoryPaddingLeft?: number,
}) => (
  <Element>
    <CategoryCircledIcon
      size={categorySize}
      paddingLeft={categoryPaddingLeft}
      paddingTop={categoryPaddingTop}>
      <Icon name={name} size={size} color={color} />
    </CategoryCircledIcon>
    <MetadataPlaceHolder ready={ready}>
      <span>{content}</span>
    </MetadataPlaceHolder>
  </Element>
);

export const ProposalPageMetadata = ({
  proposal,
  showCategories,
  showDistricts,
  showNullEstimation,
}: Props) => {
  const estimation = !proposal?.estimation && showNullEstimation ? 0 : proposal?.estimation;

  return (
    <Card id="ProposalPageMetadata">
      {((showCategories && proposal?.category) ||
        (showDistricts && proposal?.district) ||
        proposal?.likers ||
        (showNullEstimation && proposal?.estimation) ||
        !proposal) && (
        <ProposalPageMetadataContainer>
          {!proposal || (showCategories && proposal?.category) ? (
            <MetadataRow
              name={ICON_NAME.tag}
              size={10}
              color={colors.primaryColor}
              ready={!!proposal}
              content={proposal?.category?.name || ''}
            />
          ) : null}
          {!proposal || (showDistricts && proposal?.district) ? (
            <MetadataRow
              name={ICON_NAME.pin}
              size={10}
              color={colors.primaryColor}
              ready={!!proposal}
              content={proposal?.district?.name || ''}
            />
          ) : null}
          {!proposal || (estimation !== null && typeof estimation !== 'undefined') ? (
            <MetadataRow
              name={ICON_NAME.accounting}
              size={10}
              color={colors.primaryColor}
              ready={!!proposal}
              content={
                <FormattedNumber
                  minimumFractionDigits={0}
                  value={estimation || 0}
                  style="currency"
                  currency="EUR"
                />
              }
            />
          ) : null}
          {!proposal || proposal?.likers.length > 0 ? (
            <Element iconOnly>
              <Icon name={ICON_NAME.love} size={14} color={colors.dangerColor} />
              <ProposalDetailLikers size="22px" proposal={proposal} newDesign />
            </Element>
          ) : null}
          <MetadataRow
            name={ICON_NAME.hashtag}
            size={10}
            color={colors.primaryColor}
            ready={!!proposal}
            content={proposal?.reference || ''}
          />
        </ProposalPageMetadataContainer>
      )}
    </Card>
  );
};

export default createFragmentContainer(ProposalPageMetadata, {
  proposal: graphql`
    fragment ProposalPageMetadata_proposal on Proposal {
      ...ProposalDetailEstimation_proposal
      ...ProposalDetailLikers_proposal
      id
      estimation
      likers {
        id
      }
      category {
        name
      }
      district {
        name
      }
      reference
    }
  `,
});
