import * as React from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import cn from 'classnames'
import { FormattedMessage, useIntl } from 'react-intl'
import { Container, Tiles } from './NoContributionsStep.style'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import colors from '~/utils/colors'
import type { NoContributionsStep_project } from '~relay/NoContributionsStep_project.graphql'
import type { NoContributionsStep_viewer } from '~relay/NoContributionsStep_viewer.graphql'
import { toast } from '~ds/Toast'
import Button from '~ds/Button/Button'
import downloadCSV from '../../../../../../../admin-next/utils/download-csv'
import Flex from '~ui/Primitives/Layout/Flex'

type Props = {
  project: NoContributionsStep_project
  viewer: NoContributionsStep_viewer
}

const ExportDataButton = ({ url, children }: { url: string; children: React.ReactElement | string }) => {
  const intl = useIntl()
  const [isLoading, setIsLoading] = React.useState(false)
  const exportData = async (url: string) => {
    await downloadCSV(
      url,
      intl,
      () => {
        setIsLoading(true)
      },
      () => {
        setIsLoading(false)
      },
      errorTranslationKey => {
        setIsLoading(false)
        toast({
          variant: 'danger',
          content: intl.formatMessage({
            id: errorTranslationKey,
          }),
        })
      },
    )
  }

  return (
    <Button
      isLoading={isLoading}
      variant="primary"
      variantColor="primary"
      variantSize="small"
      onClick={() => exportData(url)}
    >
      {children}
    </Button>
  )
}

const NoContributionsStep = ({ project, viewer }: Props) => {
  const intl = useIntl()
  const consultationStep = project.steps.find(({ __typename }) => __typename === 'ConsultationStep')
  const hasConsultationStep = !!consultationStep
  const viewerBelongsToAnOrganization = viewer.organizations.length > 0

  return (
    <Container>
      {hasConsultationStep ? (
        <FormattedMessage id="consultation.step" tagName="p" />
      ) : (
        <FormattedMessage id="help.title.no-deposition-step" tagName="p" />
      )}
      {hasConsultationStep && !viewerBelongsToAnOrganization && (
        <FormattedMessage id="help.text.no-deposition-step" tagName="p" />
      )}
      {hasConsultationStep && viewerBelongsToAnOrganization && (
        <FormattedMessage id="help.text.no-deposition-step-organization" tagName="p" />
      )}

      {hasConsultationStep && viewerBelongsToAnOrganization && (
        <Flex spacing={4}>
          <ExportDataButton url={consultationStep.exportStepUrl}>
            {intl.formatMessage({ id: 'download.contributions' })}
          </ExportDataButton>
        </Flex>
      )}

      {hasConsultationStep && (
        <Tiles>
          {hasConsultationStep && (
            <>
              <li>
                <a
                  href={`/admin/capco/app/opinion/list?filter[consultation__step__projectAbstractStep__project][value]=${project._id}`}
                  className={cn({
                    disabled: viewerBelongsToAnOrganization || project?.proposalConsultation.totalCount === 0,
                  })}
                >
                  <Icon name={ICON_NAME.bookmark} size={40} color={colors.darkGray} />
                  <FormattedMessage
                    id="shortcut.proposition.consultation"
                    values={{
                      num: project.proposalConsultation.totalCount,
                    }}
                  />
                </a>
              </li>

              <li>
                <a
                  href={`/admin/capco/app/argument/list?filter[opinion__consultation__step__projectAbstractStep__project][value]=${project._id}`}
                  className={cn({
                    disabled: viewerBelongsToAnOrganization || project.argument.totalCount === 0,
                  })}
                >
                  <Icon name={ICON_NAME.argument} size={40} color={colors.darkGray} />
                  <FormattedMessage
                    id="shortcut.opinion"
                    values={{
                      num: project.argument.totalCount,
                    }}
                  />
                </a>
              </li>

              <li>
                <a
                  href={`/admin/capco/app/opinionversion/list?filter[parent__consultation__step__projectAbstractStep__project][value]=${project._id}`}
                  className={cn({
                    disabled: viewerBelongsToAnOrganization || project.amendement.totalCount === 0,
                  })}
                >
                  <Icon name={ICON_NAME.legalHammer} size={40} color={colors.darkGray} />
                  <FormattedMessage
                    id="shortcut-amendments"
                    values={{
                      num: project.amendement.totalCount,
                    }}
                  />
                </a>
              </li>

              <li>
                <a
                  href={`/admin/capco/app/source/list?filter[opinion__consultation__step__projectAbstractStep__project][value]=${project._id}`}
                  className={cn({
                    disabled: viewerBelongsToAnOrganization || project.source.totalCount === 0,
                  })}
                >
                  <Icon name={ICON_NAME.messageBubbleSearch} size={40} color={colors.darkGray} />
                  <FormattedMessage
                    id="shortcut.sources"
                    values={{
                      num: project.source.totalCount,
                    }}
                  />
                </a>
              </li>
            </>
          )}
        </Tiles>
      )}
    </Container>
  )
}

export default createFragmentContainer(NoContributionsStep, {
  viewer: graphql`
    fragment NoContributionsStep_viewer on User {
      organizations {
        id
      }
    }
  `,
  project: graphql`
    fragment NoContributionsStep_project on Project {
      _id
      steps {
        __typename
        ... on ConsultationStep {
          exportStepUrl
          exportContributorsUrl
        }
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
    }
  `,
})
