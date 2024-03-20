import React, { useRef } from 'react'
import { FormLabel, Box } from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { graphql, useFragment } from 'react-relay'
import { useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { ConsultationModel_query$key } from '@relay/ConsultationModel_query.graphql'

type Props = {
  query: ConsultationModel_query$key
  consultationFormKey: string
  currentConsultationId: string | undefined
  children?: React.ReactNode
}

const QUERY_FRAGMENT = graphql`
  fragment ConsultationModel_query on Query {
    viewer {
      organizations {
        ... on ConsultationOwner {
          consultationsWithStep: consultations {
            edges {
              node {
                id
                title
                step {
                  project {
                    title
                  }
                }
              }
            }
          }
          consultations {
            edges {
              node {
                id
                sections {
                  ...ConsultationStepFormSectionFragment @relay(mask: false)
                  sections {
                    ...ConsultationStepFormSectionFragment @relay(mask: false)
                    sections {
                      ...ConsultationStepFormSectionFragment @relay(mask: false)
                      sections {
                        ...ConsultationStepFormSectionFragment @relay(mask: false)
                        sections {
                          ...ConsultationStepFormSectionFragment @relay(mask: false)
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    consultationsWithStep: consultations {
      edges {
        node {
          id
          title
          step {
            project {
              title
            }
          }
        }
      }
    }
    consultations {
      edges {
        node {
          id
          sections {
            ...ConsultationStepFormSectionFragment @relay(mask: false)
            sections {
              ...ConsultationStepFormSectionFragment @relay(mask: false)
              sections {
                ...ConsultationStepFormSectionFragment @relay(mask: false)
                sections {
                  ...ConsultationStepFormSectionFragment @relay(mask: false)
                  sections {
                    ...ConsultationStepFormSectionFragment @relay(mask: false)
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

const ConsultationModel: React.FC<Props> = ({
  query: queryRef,
  consultationFormKey,
  currentConsultationId,
  children,
}) => {
  const intl = useIntl()
  const query = useFragment<ConsultationModel_query$key>(QUERY_FRAGMENT, queryRef)
  const viewer = query.viewer
  const organization = viewer.organizations[0] ?? null

  const owner = organization ?? query

  const { control, setValue, watch } = useFormContext()

  const consultations = owner.consultations.edges.map(edge => edge?.node) ?? []
  const consultationsWithStep =
    owner.consultationsWithStep.edges.map(edge => edge?.node).filter(node => node.id !== currentConsultationId) ?? []

  const options = consultationsWithStep.map(consultation => {
    const projectTitle = consultation.step?.project?.title
    return {
      value: consultation.id,
      label: projectTitle ? `${projectTitle} - ${consultation.title}` : consultation.title,
    }
  })

  const initialModelValue = useRef<string>(watch(`${consultationFormKey}.model`))

  const model = watch(`${consultationFormKey}.model`)

  const onChange = (value: any) => {
    const selectedModel = consultations.find(consultation => consultation.id === value) ?? null
    if (selectedModel) {
      const model = initialModelValue.current
        ? { ...selectedModel, id: initialModelValue.current }
        : { ...selectedModel, id: `temp-${crypto.randomUUID()}` }

      setValue(consultationFormKey, model)
      setValue(`${consultationFormKey}.sections`, model.sections)
      return
    }

    setValue(`${consultationFormKey}.title`, '')
    setValue(`${consultationFormKey}.description`, '')
    setValue(`${consultationFormKey}.sections`, [])
  }

  return (
    <>
      <Box ml={4} mb={6}>
        <FormControl control={control} name={`${consultationFormKey}.model`} id={`${consultationFormKey}.model`}>
          <FormLabel label={intl.formatMessage({ id: 'select-a-consultation' })} />
          <FieldInput
            name={`${consultationFormKey}.model`}
            control={control}
            type="select"
            options={options}
            onChange={onChange}
            clearable
          />
        </FormControl>
      </Box>
      {model && children}
    </>
  )
}

export default ConsultationModel
