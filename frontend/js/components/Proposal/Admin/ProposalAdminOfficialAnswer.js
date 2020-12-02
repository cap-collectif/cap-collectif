// @flow
import React, { useState } from 'react';
import moment from 'moment';
import styled, { type StyledComponent } from 'styled-components';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage, FormattedDate } from 'react-intl';
import type { ProposalAdminOfficialAnswer_proposal } from '~relay/ProposalAdminOfficialAnswer_proposal.graphql';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import colors, { styleGuideColors } from '~/utils/colors';
import { MAIN_BORDER_RADIUS, MAIN_BORDER_RADIUS_SIZE } from '~/utils/styles/variables';
import { Container as InfoContainer } from '~/components/Admin/Emailing/EmailingList/NoMailingList/NoMailingList.style';
import SubmitButton from '~/components/Form/SubmitButton';
import WYSIWYGRender from '~/components/Form/WYSIWYGRender';
import { Label } from '~/components/Ui/Labels/Label';
import ProposalAdminOfficialAnswerForm from './ProposalAdminOfficialAnswerForm';

type Props = {|
  proposal: ProposalAdminOfficialAnswer_proposal,
|};

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  background: ${colors.white};
  ${MAIN_BORDER_RADIUS};
  padding: 25px;
  margin-bottom: 25px;

  h3 {
    font-size: 18px;
    color: ${styleGuideColors.blue800};
    font-weight: 600;
    margin: 0;
    margin-right: 10px;
  }

  h3 + span {
    color: rgba(0, 0, 0, 0.6) !important;
    border-radius: ${MAIN_BORDER_RADIUS_SIZE} !important;
  }

  > div:first-child {
    display: flex;
    align-items: center;
    margin-bottom: 30px;
  }
`;

type View = 'VIEW' | 'EDIT' | 'NONE';

export const ProposalAdminOfficialAnswer = ({ proposal }: Props) => {
  const { officialResponse } = proposal;
  const hasAnalysis = proposal?.project?.hasAnalysis;
  const authors = officialResponse?.authors || [];
  const [mode, setMode] = useState<View>(officialResponse ? 'VIEW' : hasAnalysis ? 'NONE' : 'EDIT');
  const isFutur = moment(officialResponse?.publishedAt).diff(moment(), 'hours') >= 1;
  return (
    <div className="mt-20">
      {mode === 'VIEW' && (
        <>
          <Container>
            <div>
              <h3>
                <FormattedMessage id="official.answer" />
              </h3>
              <Label
                color={isFutur ? styleGuideColors.orange150 : styleGuideColors.green150}
                fontSize={12}>
                <FormattedMessage
                  id={
                    isFutur
                      ? 'global.plannedDate.plannedTime.feminine'
                      : 'global.publishDate.publishTime.feminine'
                  }
                  values={{
                    date: (
                      <FormattedDate
                        value={moment(officialResponse?.publishedAt)}
                        day="numeric"
                        month="long"
                        year="numeric"
                      />
                    ),
                    time: (
                      <FormattedDate
                        value={moment(officialResponse?.publishedAt)}
                        hour="numeric"
                        minute="numeric"
                      />
                    ),
                  }}
                />
              </Label>
            </div>
            {officialResponse?.body && <WYSIWYGRender value={officialResponse?.body} />}
            <br />
            {authors.length && (
              <span style={{ color: colors.darkerGray }}>
                {'- '}
                {authors?.length < 2 ? (
                  <span>{authors[0].label}</span>
                ) : (
                  <FormattedMessage
                    id="project-authors"
                    values={{
                      authorName: authors[0].label,
                      number: authors.length - 1,
                    }}
                  />
                )}
              </span>
            )}
          </Container>

          <SubmitButton
            type="submit"
            id="proposal_admin_official_answer_publish"
            bsStyle="primary"
            onSubmit={() => {
              setMode('EDIT');
            }}
            label="global.edit"
          />
        </>
      )}
      {mode === 'EDIT' && (
        <ProposalAdminOfficialAnswerForm proposal={proposal} onValidate={() => setMode('VIEW')} />
      )}
      {mode === 'NONE' && (
        <InfoContainer>
          <Icon name={ICON_NAME.stampedPaper} color={colors.white} size={64} />

          <FormattedMessage id="title.analysisPhase.configured" tagName="p" />
          <FormattedMessage id="text.officialAnswer.publish.explanation" tagName="p" />

          <a href={proposal.form?.adminUrl}>
            <FormattedMessage id="link.parameters.check" />
          </a>
        </InfoContainer>
      )}
    </div>
  );
};

export default createFragmentContainer(ProposalAdminOfficialAnswer, {
  proposal: graphql`
    fragment ProposalAdminOfficialAnswer_proposal on Proposal {
      id
      form {
        adminUrl
      }
      ...ProposalAdminOfficialAnswerForm_proposal
      project {
        id
        hasAnalysis
      }
      officialResponse {
        id
        body
        authors {
          value: id
          label: username
        }
        publishedAt
      }
    }
  `,
});
