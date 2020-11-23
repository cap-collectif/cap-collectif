// @flow
import React from 'react';
import ReactPlaceholder from 'react-placeholder';
import { TextRow } from 'react-placeholder/lib/placeholders';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import WYSIWYGRender from '~/components/Form/WYSIWYGRender';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import colors from '~/utils/colors';

import type { ProposalPageDescription_proposal } from '~relay/ProposalPageDescription_proposal.graphql';
import {
  Card,
  CategoryContainer,
  CategoryCircledIcon,
  CategoryTitle,
} from '~/components/Proposal/Page/ProposalPage.style';

type Props = {
  proposal: ?ProposalPageDescription_proposal,
};

const placeholder = (
  <div style={{ marginLeft: 15 }}>
    <TextRow color={colors.borderColor} style={{ width: '100%', height: 12, marginTop: 5 }} />
    <TextRow color={colors.borderColor} style={{ width: '50%', height: 12, marginTop: 15 }} />
  </div>
);

export const ProposalPageDescription = ({ proposal }: Props) => {
  if (proposal && !proposal.body && !proposal.summary) return null;
  return (
    <Card>
      <CategoryContainer>
        <CategoryTitle>
          <CategoryCircledIcon paddingLeft={10}>
            <Icon name={ICON_NAME.fileText} size={20} color={colors.secondaryGray} />
          </CategoryCircledIcon>
          <h3>
            <FormattedMessage id="global.description" />
          </h3>
        </CategoryTitle>
        {proposal?.summary && <><p style={{ fontWeight: 600 }}>{proposal?.summary}</p><br/></>}
        <ReactPlaceholder
          showLoadingAnimation
          customPlaceholder={placeholder}
          ready={proposal !== null}>
          <WYSIWYGRender value={proposal?.body} />
        </ReactPlaceholder>
      </CategoryContainer>
    </Card>
  );
};

export default createFragmentContainer(ProposalPageDescription, {
  proposal: graphql`
    fragment ProposalPageDescription_proposal on Proposal {
      body
      summary
    }
  `,
});
