import { type FC } from 'react'
import { useIntl } from 'react-intl'
import {
  Flex,
  Text,
  MultiStepModal,
  Modal,
  Heading,
  Button,
  useMultiStepModal,
  CapUIIcon,
  Box,
  ButtonQuickAction,
} from '@cap-collectif/ui'
import ProposalListSearchField from '@components/Form/ProposalListSearchField'
import { useFieldArray, useFormContext } from 'react-hook-form'

type SelectProposalsModalProps = { onCancel: () => void; stepId: string; isNew: boolean; votesMin: number }

const SelectProposalsModal: FC<SelectProposalsModalProps> = ({ onCancel, stepId, isNew, votesMin }) => {
  const intl = useIntl()
  const { control, watch } = useFormContext()

  const { fields, remove, append } = useFieldArray({
    control,
    name: `votes`,
  })

  const watchFieldArray = watch('votes')
  const votes = fields.map((field, index) => {
    return {
      ...field,
      ...watchFieldArray[index],
    }
  })

  const { hide, goToNextStep } = useMultiStepModal()

  return (
    <>
      <MultiStepModal.Header>
        {isNew ? (
          <Modal.Header.Label>{intl.formatMessage({ id: 'mediator.new_participant' })}</Modal.Header.Label>
        ) : null}
        <Heading>
          {intl.formatMessage({ id: isNew ? 'mediator.select_x_proposal' : 'mediator.edit_vote' }, { num: votesMin })}
        </Heading>
      </MultiStepModal.Header>
      <Modal.Body>
        <ProposalListSearchField
          stepId={stepId}
          onSelect={data => {
            append(data)
          }}
          selectedIds={watchFieldArray?.map(f => f.value) || []}
          label={intl.formatMessage({ id: 'proposal_list' })}
        />
        {votes.map((vote, index) => {
          return (
            <Flex
              key={vote.id}
              boxShadow="small"
              borderRadius="accordion"
              p={2}
              mt={4}
              justifyContent="space-between"
              alignItems="center"
            >
              <Flex alignItems="center">
                <Box
                  as={vote.media ? 'img' : 'div'}
                  // @ts-expect-error div cannot have src prop
                  src={vote.media || undefined}
                  width="112px"
                  height="69px"
                  borderRadius="button"
                  flex="none"
                  bg="gray.200"
                  mr={4}
                />
                <Text truncate={130} fontWeight={600}>
                  {vote.label}
                </Text>
              </Flex>
              <ButtonQuickAction
                variantColor="danger"
                icon={CapUIIcon.Trash}
                label={intl.formatMessage({ id: 'action_delete' })}
                onClick={() => remove(index)}
              />
            </Flex>
          )
        })}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          variantColor="primary"
          variantSize="big"
          onClick={() => {
            onCancel()
            hide()
          }}
        >
          {intl.formatMessage({ id: 'cancel' })}
        </Button>
        <Button
          variant="primary"
          variantColor="primary"
          variantSize="big"
          onClick={goToNextStep}
          rightIcon={CapUIIcon.LongArrowRight}
        >
          {intl.formatMessage({ id: 'global.next' })}
        </Button>
      </Modal.Footer>
    </>
  )
}

export default SelectProposalsModal
