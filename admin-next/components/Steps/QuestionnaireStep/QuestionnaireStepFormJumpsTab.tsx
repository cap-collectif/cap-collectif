import React, { useState } from 'react'
import { Button, CapUIIcon, Menu, ListCard, Flex, ButtonGroup, ButtonQuickAction, Text, Box } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { useMultipleDisclosure } from '@liinkiing/react-hooks'
import RedirectionModal from './ConditionalJumpModal/RedirectionModal'
import ConditionalJumpModal from './ConditionalJumpModal/ConditionalJumpModal'
import { useEventListener } from '@hooks/useEventListener'

const ADD_NEW_JUMP = -1

const QuestionnaireStepFormJumpsTab: React.FC<{ fieldName: string }> = ({ fieldName }) => {
  const intl = useIntl()
  const { isOpen, onOpen, onClose } = useMultipleDisclosure({
    'redirection-modal': false,
    'jumps-modal': false,
  })
  const [jumpIndex, setJumpIndex] = useState(ADD_NEW_JUMP)

  const { control, watch, setValue } = useFormContext()

  const {
    fields: questionsWithJumps,
    append,
    remove,
    update,
  } = useFieldArray({
    control,
    name: `${fieldName}.questionsWithJumps`,
  })

  const questionsWithJumpsValues = watch(`${fieldName}.questionsWithJumps`, questionsWithJumps)
  const temporaryJump = watch('temporaryJump')

  useEventListener('removeJump', e => {
    const index = e?.data?.index
    remove(index)
  })

  return (
    <>
      {isOpen('redirection-modal') ? (
        <RedirectionModal
          onClose={() => {
            setValue('temporaryJump', {})
            onClose('redirection-modal')()
          }}
          onSuccess={() => {
            if (jumpIndex === ADD_NEW_JUMP)
              append({
                ...temporaryJump,
              })
            //tempId
            else update(jumpIndex, temporaryJump)
            setValue('temporaryJump', {})
          }}
          isNewJump={jumpIndex === ADD_NEW_JUMP}
          fieldName={fieldName}
        />
      ) : null}
      {isOpen('jumps-modal') ? (
        <ConditionalJumpModal
          onClose={() => {
            setValue('temporaryJump', {})
            onClose('jumps-modal')()
          }}
          onSuccess={() => {
            if (jumpIndex === ADD_NEW_JUMP)
              append({
                ...temporaryJump,
              })
            else update(jumpIndex, temporaryJump)
            setValue('temporaryJump', {})
          }}
          isNewJump={jumpIndex === ADD_NEW_JUMP}
          fieldName={fieldName}
        />
      ) : null}

      {questionsWithJumps.length
        ? questionsWithJumps.map((jump, index) => {
            const isRedirection =
              !!questionsWithJumpsValues[index].alwaysJumpDestinationQuestion &&
              !questionsWithJumpsValues[index].jumps.length
            return (
              <ListCard.Item
                key={jump.id}
                bg="white"
                borderRadius="normal"
                borderWidth="1px"
                borderColor="gray.200"
                mb={2}
                mt={2}
                py={2}
                sx={{ '.cap-buttonGroup': { opacity: 0 } }}
                _hover={{ '.cap-buttonGroup': { opacity: 1 } }}
                width="100%"
              >
                <Flex direction="column">
                  <Text color="gray.500" fontSize={1} fontWeight={400}>
                    {intl.formatMessage({
                      id: isRedirection ? 'invitations-redirection.title' : 'jumps',
                    })}
                  </Text>
                  <Text color="blue.900" fontSize={2} fontWeight={600}>
                    {`${questionsWithJumpsValues[index].title} ${isRedirection ? '->' : '-'} ${
                      isRedirection
                        ? questionsWithJumpsValues[index].alwaysJumpDestinationQuestion.title
                        : intl.formatMessage(
                            {
                              id: 'jumps-number',
                            },
                            {
                              num: questionsWithJumpsValues[index].jumps.length,
                            },
                          )
                    }`}
                  </Text>
                </Flex>
                <ButtonGroup>
                  <ButtonQuickAction
                    tooltipZIndex={2}
                    variantColor="blue"
                    icon={CapUIIcon.Pencil}
                    label={intl.formatMessage({
                      id: 'global.edit',
                    })}
                    onClick={() => {
                      setValue('temporaryJump', questionsWithJumpsValues[index])
                      setJumpIndex(index)
                      onOpen(isRedirection ? 'redirection-modal' : 'jumps-modal')()
                    }}
                    type="button"
                  />
                  <ButtonQuickAction
                    tooltipZIndex={2}
                    onClick={() => remove(index)}
                    variantColor="red"
                    icon={CapUIIcon.Trash}
                    label={intl.formatMessage({
                      id: 'global.delete',
                    })}
                    type="button"
                  />
                </ButtonGroup>
              </ListCard.Item>
            )
          })
        : null}
      <Box mt={4}>
        <Menu
          placement="bottom-start"
          closeOnSelect={false}
          disclosure={
            <Button variantColor="primary" variant="secondary" variantSize="small" rightIcon={CapUIIcon.ArrowDown}>
              {intl.formatMessage({ id: 'global.add' })}
            </Button>
          }
        >
          <Menu.List>
            <Menu.Item
              onClick={() => {
                setJumpIndex(ADD_NEW_JUMP)
                setValue('temporaryJump', { jumps: [{ conditions: [{}] }] })
                onOpen('jumps-modal')()
              }}
            >
              {intl.formatMessage({ id: 'a-conditional-jump' })}
            </Menu.Item>
            <Menu.Item
              onClick={() => {
                setJumpIndex(ADD_NEW_JUMP)
                onOpen('redirection-modal')()
              }}
            >
              {intl.formatMessage({ id: 'redirection-always-goto' })}
            </Menu.Item>
          </Menu.List>
        </Menu>
      </Box>
    </>
  )
}

export default QuestionnaireStepFormJumpsTab
