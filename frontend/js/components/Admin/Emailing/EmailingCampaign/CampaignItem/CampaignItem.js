// @flow
import * as React from 'react';
import moment from 'moment';
import { createFragmentContainer, graphql } from 'react-relay';
import { useIntl } from 'react-intl';
import { Container, Circle, InfoRow } from './CampaignItem.style';
import Icon, { ICON_NAME } from '~ds/Icon/Icon';
import { type CampaignItem_campaign } from '~relay/CampaignItem_campaign.graphql';
import { getWordingMailingInternal } from '~/components/Admin/Emailing/MailParameter/Parameter';
import Flex from '~ui/Primitives/Layout/Flex';

type Props = {|
  campaign: CampaignItem_campaign,
  selected: boolean,
  rowId: string,
|};

const STATUS_CAMPAIGN = {
  SENT: {
    label: 'global-sent',
    color: '#06BDA5',
  },
  PLANNED: {
    label: 'global-planned',
    color: '#F5C36A',
  },
  DRAFT: {
    label: 'global-draft',
    color: '#D8D8D8',
  },
  ARCHIVED: {
    label: 'global-archived',
    color: '#D8D8D8',
  },
};

export const CampaignItem = ({ campaign, selected }: Props) => {
  const { id, name, mailingList, sendAt, status, mailingInternal, emailingGroup } = campaign;
  const intl = useIntl();

  return (
    <Container rowId={id} selected={selected}>
      <h3>
        <a href={`/admin/mailingCampaign/edit/${id}`} rel="noopener noreferrer">
          {name}
        </a>
      </h3>

      <InfoRow>
        <p>
          <Circle color={STATUS_CAMPAIGN[status].color} ariaHidden />

          <span className="label-status">
            {intl.formatMessage({ id: STATUS_CAMPAIGN[status].label })}
          </span>
        </p>

        {sendAt && (
          <p>
            <span className="separator">•</span>

            <span>
              {intl.formatDate(moment(sendAt), {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
              })}
            </span>
          </p>
        )}
      </InfoRow>

      {(mailingList || mailingInternal || emailingGroup) && (
        <Flex direction="row" align="center">
          <Icon name={ICON_NAME.USER_O} size="md" color="gray.500" />
          <span>
            {mailingList && mailingList.name}
            {emailingGroup && emailingGroup.title}
            {mailingInternal && getWordingMailingInternal(mailingInternal, intl)}
          </span>
        </Flex>
      )}
    </Container>
  );
};

export default createFragmentContainer(CampaignItem, {
  campaign: graphql`
    fragment CampaignItem_campaign on EmailingCampaign {
      id
      name
      sendAt
      status
      mailingList {
        name
      }
      emailingGroup {
        title
      }
      mailingInternal
    }
  `,
});
