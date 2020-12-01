// @flow
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { TextRow } from 'react-placeholder/lib/placeholders';
import type { CampaignsStateValues } from '~/components/Admin/Emailing/EmailingCampaign/DashboardCampaign/DashboardCampaign.reducer';
import {
  Header,
  Tab,
  ContentContainer,
  PickableContainer,
  PickableHeader,
  Item,
} from './DashboardCampaignPlaceholder.style';
import PickableList from '~ui/List/PickableList';
import Collapsable from '~ui/Collapsable';
import ErrorQuery from '~/components/Error/ErrorQuery/ErrorQuery';
import colors from '~/utils/colors';

type Props = {|
  hasError: boolean,
  fetchData: ?() => void,
  selectedTab: CampaignsStateValues,
|};

const DashboardCampaignPlaceholder = ({ selectedTab, fetchData, hasError }: Props) => {
  const intl = useIntl();

  return (
    <>
      <Header>
        <div>
          <Tab selected={selectedTab === 'ALL'}>
            {intl.formatMessage({ id: 'filter.count.status.all' }, { num: 0 })}
          </Tab>
          <Tab selected={selectedTab === 'SENT'}>
            {intl.formatMessage({ id: 'filter.count.status.sent' }, { num: 0 })}
          </Tab>
          <Tab selected={selectedTab === 'PLANNED'}>
            {intl.formatMessage({ id: 'filter.count.status.planned' }, { num: 0 })}
          </Tab>
          <Tab selected={selectedTab === 'DRAFT'}>
            {intl.formatMessage({ id: 'filter.count.status.draft' }, { num: 0 })}
          </Tab>
        </div>
        <div>
          <TextRow color="#fff" style={{ width: 100, height: 30, marginRight: 15 }} />
          <TextRow color="#fff" style={{ width: 250, height: 30 }} />
        </div>
      </Header>

      <PickableContainer>
        <PickableHeader disabled isSelectable={false}>
          <Collapsable align="right">
            <Collapsable.Button>
              <FormattedMessage id="argument.sort.label" />
            </Collapsable.Button>
          </Collapsable>
        </PickableHeader>

        <PickableList.Body>
          <ContentContainer>
            {hasError ? (
              <ErrorQuery retry={fetchData} />
            ) : (
              new Array(5).fill(null).map((value, idx) => (
                <Item key={idx}>
                  <TextRow
                    color={colors.borderColor}
                    style={{ width: 250, height: 15, marginBottom: 0, marginTop: 0 }}
                  />
                  <TextRow
                    color={colors.borderColor}
                    style={{ width: 100, height: 15, marginBottom: 8, marginTop: 8 }}
                  />
                  <TextRow
                    color={colors.borderColor}
                    style={{ width: 200, height: 15, marginBottom: 0, marginTop: 0 }}
                  />
                </Item>
              ))
            )}
          </ContentContainer>
        </PickableList.Body>
      </PickableContainer>
    </>
  );
};

export default DashboardCampaignPlaceholder;
