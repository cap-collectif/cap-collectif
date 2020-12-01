// @flow
import * as React from 'react';
import moment from 'moment';
import { createFragmentContainer, graphql } from 'react-relay';
import { useIntl } from 'react-intl';
import { Container, Circle, InfoRow } from './CampaignItem.style';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import { type CampaignItem_campaign } from '~relay/CampaignItem_campaign.graphql';
import colors from '~/utils/colors';
import { getWordingMailingInternal } from '~/components/Admin/Emailing/MailParameter/Parameter';

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
  const { id, name, mailingList, sendAt, status, mailingInternal } = campaign;
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

      {(mailingList || mailingInternal) && (
        <p>
          <Icon name={ICON_NAME.newUser} size={15} color={colors.secondaryGray} />
          {mailingList && mailingList.name}
          {mailingInternal && getWordingMailingInternal(mailingInternal, intl)}
        </p>
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
      mailingInternal
    }
  `,
});
