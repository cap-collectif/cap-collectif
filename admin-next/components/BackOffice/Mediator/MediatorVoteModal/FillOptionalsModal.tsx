import { type FC } from 'react'
import { useIntl } from 'react-intl'
import { MultiStepModal, Modal, Heading, Button, useMultiStepModal, FormLabel, Box } from '@cap-collectif/ui'
import { useFormContext } from 'react-hook-form'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { graphql, useFragment } from 'react-relay'
import { FillOptionalsModal_step$key } from '@relay/FillOptionalsModal_step.graphql'

type FillOptionalsModalProps = {
  step: FillOptionalsModal_step$key
  onSubmit: (data: any) => void
  isNew: boolean
}

const STEP_FRAGMENT = graphql`
  fragment FillOptionalsModal_step on RequirementStep {
    requirements {
      edges {
        node {
          ... on PhoneRequirement {
            __typename
          }
        }
      }
    }
  }
`

const FillOptionalsModal: FC<FillOptionalsModalProps> = ({ step: stepRef, onSubmit, isNew }) => {
  const intl = useIntl()
  const step = useFragment(STEP_FRAGMENT, stepRef)
  const requirements = step.requirements.edges.map(edge => edge.node)
  const { control, formState, handleSubmit } = useFormContext()
  const { goToPreviousStep } = useMultiStepModal()

  return (
    <>
      <MultiStepModal.Header>
        {isNew ? (
          <Modal.Header.Label>{intl.formatMessage({ id: 'mediator.new_participant' })}</Modal.Header.Label>
        ) : null}
        <Heading>{intl.formatMessage({ id: 'mediator.optional_informations' })}</Heading>
      </MultiStepModal.Header>
      <Modal.Body>
        <Box width="50%">
          <FormControl name="email" control={control}>
            <FormLabel htmlFor="email" label={intl.formatMessage({ id: 'global.email' })} />
            <FieldInput id="email" name="email" control={control} type="email" minLength={2} />
          </FormControl>
          {requirements.map(requirement => {
            if (requirement.__typename === 'PhoneRequirement') {
              return (
                <FormControl name="phone" control={control}>
                  <FormLabel htmlFor="phone" label={intl.formatMessage({ id: 'filter.label_phone' })} />
                  <FieldInput id="phone" name="phone" control={control} type="tel" />
                </FormControl>
              )
            }
            return null
          })}
        </Box>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" variantColor="primary" variantSize="big" onClick={goToPreviousStep}>
          {intl.formatMessage({ id: 'global.back' })}
        </Button>
        <Button
          variant="primary"
          variantColor="primary"
          variantSize="big"
          type="submit"
          isLoading={formState?.isSubmitting}
          disabled={!formState.isValid}
          onClick={handleSubmit(onSubmit)}
        >
          {intl.formatMessage({ id: 'global.validate' })}
        </Button>
      </Modal.Footer>
    </>
  )
}

export default FillOptionalsModal
