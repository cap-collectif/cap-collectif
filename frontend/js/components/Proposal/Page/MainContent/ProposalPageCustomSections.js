// @flow
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { connect } from 'react-redux';
import type { ProposalPageCustomSections_proposal } from '~relay/ProposalPageCustomSections_proposal.graphql';
import {
  Card,
  CategoryContainer,
  CategoryCircledIcon,
  CategoryTitle,
  Circle,
} from '~/components/Proposal/Page/ProposalPage.style';
import getAvailableQuestionsIds from '~/utils/form/getAvailableQuestionsIds';
import formatInitialResponsesValues from '~/utils/form/formatInitialResponsesValues';
import NewProposalResponse from './NewProposalResponse';
import type { GlobalState } from '~/types';

type Props = {
  proposal: ProposalPageCustomSections_proposal,
  cardColor: string,
};

export const ProposalPageCustomSections = ({ proposal, cardColor }: Props) => {
  if (!proposal) return null;

  const proposalForm = proposal.form;

  const formattedResponses = formatInitialResponsesValues(
    proposalForm.questions,
    proposal.responses ? proposal.responses : [],
  );

  const availabeQuestionIds = getAvailableQuestionsIds(proposalForm.questions, formattedResponses);
  /**
   * This code will transform
   * [SectionA, Q1, Q2, SectionB, Q3]
   * into
   * [
   *  {SectionA, child: [Q1,Q2]}
   *  {SectionB, child: [Q3]}
   * ]
   */

  const responses = proposal.responses
    .filter(Boolean)
    .filter(response => response.question)
    .filter(response => availabeQuestionIds.includes(response.question.id));

  const firstSectionIndex = responses.findIndex(
    response => response.question.__typename === 'SectionQuestion' && !response.question.level,
  );

  const firstSection = responses.slice(
    0,
    firstSectionIndex !== -1 ? firstSectionIndex : responses.length,
  );

  const rest = responses.slice(firstSectionIndex !== -1 ? firstSectionIndex : 0, responses.length);

  const formattedSections =
    firstSectionIndex !== -1
      ? rest.reduce((arr, el) => {
          if (el.question.__typename === 'SectionQuestion' && el.question.level === 0) {
            arr.push({ ...el, child: [] });
          } else {
            arr[arr.length - 1].child.push({ ...el });
          }

          return arr;
        }, [])
      : [];

  if (!formattedSections.length && !firstSection.length) return null;

  return (
    <>
      {firstSection.length ? (
        <Card withBorder color={cardColor}>
          <CategoryContainer paddingTop={5}>
            {firstSection.map((response, index) => (
              <NewProposalResponse key={index} response={response} />
            ))}
          </CategoryContainer>
        </Card>
      ) : null}
      {formattedSections.map((section, idx) => (
        <Card withBorder color={cardColor} key={idx}>
          <CategoryContainer>
            <CategoryTitle>
              <CategoryCircledIcon paddingTop={9} paddingLeft={9}>
                <Circle />
              </CategoryCircledIcon>
              <h3>{section.question.title}</h3>
            </CategoryTitle>
            {section.child.map((response, index) => (
              <NewProposalResponse key={index} response={response} />
            ))}
          </CategoryContainer>
        </Card>
      ))}
    </>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  cardColor: state.default.parameters['color.btn.primary.bg'],
});

export default createFragmentContainer(
  connect<any, any, _, _, _, _>(mapStateToProps)(ProposalPageCustomSections),
  {
    proposal: graphql`
      fragment ProposalPageCustomSections_proposal on Proposal {
        id
        form {
          questions {
            id
            ...responsesHelper_question @relay(mask: false)
          }
        }
        responses {
          question {
            id
            __typename
            title
            ... on SectionQuestion {
              level
            }
          }
          ...responsesHelper_response @relay(mask: false)
          ...NewProposalResponse_response
        }
      }
    `,
  },
);
