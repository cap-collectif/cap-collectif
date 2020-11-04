// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import cn from 'classnames';
import { FormattedMessage } from 'react-intl';
import { Container, Tiles } from './NoCollectStep.style';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import colors from '~/utils/colors';
import type { NoCollectStep_project } from '~relay/NoCollectStep_project.graphql';

type Props = {|
  project: NoCollectStep_project,
|};

const NoCollectStep = ({ project }: Props) => {
  const hasQuestionnaireStep =
    project.steps.filter(({ __typename }) => __typename === 'QuestionnaireStep').length > 0;
  const hasConsultationStep =
    project.steps.filter(({ __typename }) => __typename === 'ConsultationStep').length > 0;

  return (
    <Container>
      <FormattedMessage id="help.title.no-deposition-step" tagName="p" />
      {(hasConsultationStep || hasQuestionnaireStep) && (
        <FormattedMessage id="help.text.no-deposition-step" tagName="p" />
      )}

      {(hasConsultationStep || hasQuestionnaireStep) && (
        <Tiles>
          {hasConsultationStep && (
            <>
              <li>
                <a
                  href={`/admin/capco/app/opinion/list?filter[consultation__step__projectAbstractStep__project][value]=${project._id}`}
                  className={cn({ disabled: project?.proposalConsultation.totalCount === 0 })}>
                  <Icon name={ICON_NAME.bookmark} size={40} color={colors.darkGray} />
                  <FormattedMessage
                    id="shortcut.proposition.consultation"
                    values={{ num: project.proposalConsultation.totalCount }}
                  />
                </a>
              </li>

              <li>
                <a
                  href={`/admin/capco/app/argument/list?filter[opinion__consultation__step__projectAbstractStep__project][value]=${project._id}`}
                  className={cn({ disabled: project.argument.totalCount === 0 })}>
                  <Icon name={ICON_NAME.argument} size={40} color={colors.darkGray} />
                  <FormattedMessage
                    id="shortcut.opinion"
                    values={{ num: project.argument.totalCount }}
                  />
                </a>
              </li>

              <li>
                <a
                  href={`/admin/capco/app/opinionversion/list?filter[parent__consultation__step__projectAbstractStep__project][value]=${project._id}`}
                  className={cn({ disabled: project.amendement.totalCount === 0 })}>
                  <Icon name={ICON_NAME.legalHammer} size={40} color={colors.darkGray} />
                  <FormattedMessage
                    id="shortcut-amendments"
                    values={{ num: project.amendement.totalCount }}
                  />
                </a>
              </li>

              <li>
                <a
                  href={`/admin/capco/app/source/list?filter[opinion__consultation__step__projectAbstractStep__project][value]=${project._id}`}
                  className={cn({ disabled: project.source.totalCount === 0 })}>
                  <Icon name={ICON_NAME.messageBubbleSearch} size={40} color={colors.darkGray} />
                  <FormattedMessage
                    id="shortcut.sources"
                    values={{ num: project.source.totalCount }}
                  />
                </a>
              </li>
            </>
          )}

          {hasQuestionnaireStep && (
            <li>
              <a
                href={`/admin/capco/app/reply/list?filter[questionnaire__step__projectAbstractStep__project][value]=${project._id}`}
                className={cn({ disabled: project.reply.totalCount === 0 })}>
                <Icon name={ICON_NAME.messageBubbleQuestion} size={40} color={colors.darkGray} />
                <FormattedMessage id="shortcut.answer" values={{ num: project.reply.totalCount }} />
              </a>
            </li>
          )}
        </Tiles>
      )}
    </Container>
  );
};

export default createFragmentContainer(NoCollectStep, {
  project: graphql`
    fragment NoCollectStep_project on Project {
      _id
      steps {
        __typename
      }
      amendement: contributions(type: OPINIONVERSION) {
        totalCount
      }
      source: contributions(type: SOURCE) {
        totalCount
      }
      argument: contributions(type: ARGUMENT) {
        totalCount
      }
      proposalConsultation: contributions(type: OPINION) {
        totalCount
      }
      reply: contributions(type: REPLY) {
        totalCount
      }
    }
  `,
});
