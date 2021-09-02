// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { useResize } from '@liinkiing/react-hooks';
import styled from 'styled-components';
import type { StyledComponent } from 'styled-components';
import { type QuestionnaireAdminResultMajority_majorityQuestion } from '~relay/QuestionnaireAdminResultMajority_majorityQuestion.graphql';
import { bootstrapGrid } from '~/utils/sizes';
import { COLORS } from '~ui/Form/Input/Majority/Majority';
import {
  Container,
  ColorRow,
  GraphContainer,
  ResponseContainer,
} from './QuestionnaireAdminResultMajority.style';

type Props = {
  majorityQuestion: QuestionnaireAdminResultMajority_majorityQuestion,
};

const Wrapper: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  width: 768px;
`;

export const medianCalculator = (
  question: QuestionnaireAdminResultMajority_majorityQuestion,
): number => {
  const categories = question?.responsesByChoice;
  const totalCount = question?.totalVotesCount;
  let currentCount = 0;

  if (totalCount === 0) return -1;

  if (totalCount === 1) {
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      if (category.count > 0) {
        return i;
      }
    }
    return -1;
  }

  if (totalCount % 2 === 0) {
    // In a list of 2N terms, we need to return the average between Nth and (N + 1)th terms usually.
    // But in our case, we want an integer value, thus we return the greater index (category).
    const midTermIndex = totalCount / 2;
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      currentCount += category.count;
      if (currentCount >= midTermIndex) {
        if (currentCount >= midTermIndex + 1) {
          return i;
        }
        return i + 1;
      }
    }
  } else {
    // In a list of 2N + 1 terms, we need to return the (N + 1)th term
    const midTermIndex = (totalCount - 1) / 2 + 1;
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      currentCount += category.count;
      if (currentCount >= midTermIndex) {
        return i;
      }
    }
  }

  return -1;
};

export const QuestionnaireAdminResultMajority = React.forwardRef<Props, HTMLElement>(
  ({ majorityQuestion }: Props, ref) => {
    const resultVoteMajority = majorityQuestion?.responsesByChoice.map(majorityType => ({
      ...COLORS[majorityType.choice],
      count: majorityType.count,
      percentage: `${((majorityType.count / majorityQuestion.totalVotesCount) * 100).toFixed(2)}%`,
    }));

    const median = medianCalculator(majorityQuestion);
    const { width } = useResize();
    const isMobile = width < bootstrapGrid.smMin;

    if (!majorityQuestion || majorityQuestion.totalVotesCount === 0) return null;

    return (
      <Wrapper ref={ref}>
        <Container active isMobile={isMobile}>
          <GraphContainer>
            <div className="median-mention">
              <FormattedMessage id="median-mention" />{' '}
              <FormattedMessage id={resultVoteMajority[median].label} />
            </div>

            <ColorRow className="color-row">
              <div className="median-indicator" />
              {resultVoteMajority.map((majorityType, idx) => (
                <div
                  key={idx}
                  style={{
                    flexBasis: majorityType.percentage,
                    backgroundColor: majorityType.color,
                  }}
                  className="answer-option"
                />
              ))}
            </ColorRow>
          </GraphContainer>

          <ResponseContainer>
            <div className="response-number-container">
              <FormattedMessage id="answer-number" />
            </div>

            {resultVoteMajority.map((majorityType, idx) => (
              <div key={idx} style={{ color: majorityType.color }} className="line-level">
                <div className="main-info-line">
                  <span>{majorityType.count}</span> <FormattedMessage id={majorityType.label} />{' '}
                </div>
                <span>{majorityType.percentage}</span>
              </div>
            ))}
          </ResponseContainer>
        </Container>
      </Wrapper>
    );
  },
);

export default createFragmentContainer(QuestionnaireAdminResultMajority, {
  majorityQuestion: graphql`
    fragment QuestionnaireAdminResultMajority_majorityQuestion on MajorityQuestion {
      responsesByChoice {
        count
        choice
      }
      totalVotesCount
    }
  `,
});
