// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import QuestionnaireAdminResultsBarChart from './QuestionnaireAdminResultsBarChart';
import QuestionnaireAdminResultsRanking from './QuestionnaireAdminResultsRanking';
import QuestionnaireAdminResultsPieChart from './QuestionnaireAdminResultsPieChart';
import QuestionnaireAdminResultsText from './QuestionnaireAdminResultsText';
import QuestionnaireAdminResultMajority from './QuestionnaireAdminResultMajority/QuestionnaireAdminResultMajority';
import type { QuestionnaireAdminResults_questionnaire } from '~relay/QuestionnaireAdminResults_questionnaire.graphql';
import QuestionnaireAdminResultsMedia from './QuestionnaireAdminResultsMedia';
import withColors from '../Utils/withColors';
import PrivateBox from '../Ui/Boxes/PrivateBox';
import type { GlobalState } from '~/types';
import QuestionnaireAdminResultsExportMenu from '~/components/Questionnaire/QuestionnaireAdminResultsExportMenu';
import Flex from '~ui/Primitives/Layout/Flex';

type Props = {|
  questionnaire: QuestionnaireAdminResults_questionnaire,
  backgroundColor: string,
  logoUrl: string,
|};

export type ChartsUrl = $ReadOnlyArray<{|
  +questionId?: string,
  +url?: string,
|}>;

export type ChartsRef = Array<{|
  +id: string,
  +ref: any
|}>

export class QuestionnaireAdminResults extends React.Component<Props> {
  
  chartsRef: ChartsRef = [];

  getFormattedResults = (question: Object) => {
    const { backgroundColor } = this.props;

    if (question.participants && question.participants.totalCount === 0) {
      return null;
    }

    // majority is also a simple question let it here :)
    if (question.type === 'majority') {
      return (
        <QuestionnaireAdminResultMajority
          majorityQuestion={question}
          ref={el => {
            this.chartsRef.push({id: question.id, ref: el})
          }}
        />
      );
    }

    if (question.__typename === 'SimpleQuestion') {
      return (
        <QuestionnaireAdminResultsText
          simpleQuestion={question}
          ref={el => {
            this.chartsRef.push({id: question.id, ref: el})
          }}
        />
      );
    }

    if (question.__typename === 'MediaQuestion') {
      return <QuestionnaireAdminResultsMedia mediaQuestion={question} />;
    }

    if (question.__typename !== 'MultipleChoiceQuestion') {
      return (
        <p className="mb-25">
          <FormattedHTMLMessage id="results-not-available" />
        </p>
      );
    }

    if (question.type === 'checkbox') {
      return (
        <QuestionnaireAdminResultsBarChart
          multipleChoiceQuestion={question}
          backgroundColor={backgroundColor}
          innerRef={el => {
            this.chartsRef.push({id: question.id, ref: el})
          }}
        />
      );
    }

    if (question.type === 'radio' || question.type === 'select' || question.type === 'button') {
      return (
        <QuestionnaireAdminResultsPieChart
          multipleChoiceQuestion={question}
          backgroundColor={backgroundColor}
          innerRef={el => {
            this.chartsRef.push({id: question.id, ref: el})
          }}
        />
      );
    }

    if (question.type === 'ranking') {
      return (
        <QuestionnaireAdminResultsRanking
          multipleChoiceQuestion={question}
          ref={el => {
           this.chartsRef.push({id: question.id, ref: el})
          }}
        />
      );
    }

    return null;
  };

  render() {
    const { questionnaire, logoUrl } = this.props;
    const questions = questionnaire.questions.filter(q => q.type !== 'section');

    return (
      <div className="box box-primary container-fluid">
        <div className="box-content mt-25">
          {questionnaire.questions && questions.length > 0 ? (
            questions.map((question, key) => (
              <div key={key}>
                <PrivateBox show={question.private} message="admin.fields.question.private">
                  <Flex justifyContent="space-between" className="mr-40">
                    <p>
                      <b>
                        {key + 1}. {question.title}
                      </b>
                      <br />
                      <span className="excerpt">
                        {question.participants && question.participants.totalCount !== 0 ? (
                          <FormattedMessage
                            id="global.counters.contributors"
                            values={{ num: question.participants.totalCount }}
                          />
                        ) : (
                          <FormattedMessage id="no-answer" />
                        )}
                        {question.participants &&
                          question.allResponses &&
                          question.allResponses.totalCount !== 0 && (
                            <React.Fragment>
                              {' '}
                              /{' '}
                              <FormattedMessage
                                id="count-answers"
                                values={{ num: question.allResponses.totalCount }}
                              />
                            </React.Fragment>
                          )}
                        <br />
                        {question.required && (
                          <b>
                            <FormattedMessage id="mandatory-question" />
                          </b>
                        )}
                      </span>
                    </p>
                    {key === 0 && (
                      <QuestionnaireAdminResultsExportMenu
                        questionnaire={questionnaire}
                        chartsRef={this.chartsRef}
                        logoUrl={logoUrl}
                      />
                    )}
                  </Flex>
                  {this.getFormattedResults(question)}
                </PrivateBox>
              </div>
            ))
          ) : (
            <div>
              <FormattedMessage id="no-question" />
            </div>
          )}
        </div>
      </div>
    );
  }
}

const container = withColors(QuestionnaireAdminResults);

const fragmentContainer = createFragmentContainer(container, {
  questionnaire: graphql`
    fragment QuestionnaireAdminResults_questionnaire on Questionnaire {
      ...QuestionnaireAdminResultsExportMenu_questionnaire
      questions {
        id
        __typename
        title
        type
        required
        private
        participants {
          totalCount
        }
        allResponses: responses {
          totalCount
        }
        ...QuestionnaireAdminResultsText_simpleQuestion
        ...QuestionnaireAdminResultsMedia_mediaQuestion
        ...QuestionnaireAdminResultsBarChart_multipleChoiceQuestion
        ...QuestionnaireAdminResultsPieChart_multipleChoiceQuestion
        ...QuestionnaireAdminResultsRanking_multipleChoiceQuestion
        ...QuestionnaireAdminResultMajority_majorityQuestion
      }
    }
  `,
});

const mapStateToProps = (state: GlobalState) => ({
  logoUrl: state.default?.images?.logoUrl,
});

export default connect<any, any, _, _, _, _>(mapStateToProps)(fragmentContainer);
