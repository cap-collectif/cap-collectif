import * as React from 'react'
import { useIntl } from 'react-intl'
import {
  Button,
  ButtonGroup,
  CapUIModalSize,
  Flex,
  FlexProps,
  FormLabel,
  Heading,
  Modal,
  Text,
} from '@cap-collectif/ui'
import Jodit from './Jodit'
import { Controller, useFormContext } from 'react-hook-form'

export type TextEditorProps = FlexProps & {
  label: string
  name: string
  placeholder?: string
  required?: boolean
  selectedLanguage?: string
  platformLanguage?: string

  buttonLabels?: {
    cancel?: string
    submit?: string
  }
  limitChars?: number
  advancedEditor?: boolean
  noModalAdvancedEditor?: boolean
}

const TextEditor: React.FC<TextEditorProps> = ({
  label,
  name,
  placeholder,
  required = false,
  selectedLanguage = 'fr',
  platformLanguage = 'fr',
  buttonLabels,
  limitChars,
  advancedEditor = true,
  noModalAdvancedEditor = false,
  ...rest
}) => {
  const intl = useIntl()
  const [isOpen, setIsOpen] = React.useState(false)
  const [reloadContent, setReloadContent] = React.useState(false)
  const { control, setValue, watch } = useFormContext()
  const value = watch(name)

  const [inModalValue, setInModalValue] = React.useState(value)

  React.useEffect(() => {
    // Trick to reset jodit content on language change
    setReloadContent(true)
    setTimeout(() => setReloadContent(false), 1)
  }, [selectedLanguage])

  return (
    <Flex direction="column" mb={4} {...rest}>
      {noModalAdvancedEditor && (
        <>
          <FormLabel htmlFor={name} label={label}>
            {required ? null : (
              <Text fontSize={2} color="gray.500">
                {intl.formatMessage({ id: 'global.optional' })}
              </Text>
            )}
          </FormLabel>
          <Jodit
            id={`${name}-JoditModal-${selectedLanguage}`}
            placeholder={placeholder}
            onChange={value => setValue(name, value)}
            value={value}
            platformLanguage={platformLanguage}
            limitChars={limitChars}
          />
        </>
      )}

      {!noModalAdvancedEditor && (
        <>
          <Flex justify="space-between" mb={1}>
            <FormLabel htmlFor={name} label={label}>
              {required ? null : (
                <Text fontSize={2} color="gray.500">
                  {intl.formatMessage({ id: 'global.optional' })}
                </Text>
              )}
            </FormLabel>
            {advancedEditor && (
              <div>
                <Button variant="link" onClick={() => setIsOpen(true)} type="button">
                  {intl.formatMessage({ id: 'advanced-editor' })}
                </Button>

                <Modal
                  show={isOpen}
                  hideOnClickOutside={false}
                  size={CapUIModalSize.Xl}
                  ariaLabel={intl.formatMessage({ id: 'delete-confirmation' })}
                  onClose={() => {
                    setInModalValue(value)
                    setIsOpen(false)
                  }}
                  forceModalDialogToFalse
                >
                  <Modal.Header>
                    <Modal.Header.Label>{intl.formatMessage({ id: 'advanced-editor' })}</Modal.Header.Label>
                    <Heading>{label}</Heading>
                  </Modal.Header>
                  <Modal.Body p={0} pt={0} sx={{ '.jodit-container': { border: 'none !important' } }}>
                    <Jodit
                      id={`${name}-JoditModal-${selectedLanguage}`}
                      placeholder={placeholder}
                      onChange={value => setInModalValue(value)}
                      value={value}
                      platformLanguage={platformLanguage}
                      limitChars={limitChars}
                    />
                  </Modal.Body>
                  <Modal.Footer spacing={2}>
                    <ButtonGroup>
                      <Button
                        type="button"
                        variantSize="big"
                        variant="secondary"
                        variantColor="hierarchy"
                        onClick={() => {
                          setInModalValue(value)
                          setIsOpen(false)
                        }}
                      >
                        {buttonLabels?.cancel ?? intl.formatMessage({ id: 'cancel' })}
                      </Button>
                      <Button
                        type="button"
                        variantSize="big"
                        variant="primary"
                        variantColor="primary"
                        onClick={() => {
                          setValue(name, inModalValue)
                          setIsOpen(false)
                        }}
                      >
                        {buttonLabels?.submit ?? intl.formatMessage({ id: 'global.validate' })}
                      </Button>
                    </ButtonGroup>
                  </Modal.Footer>
                </Modal>
              </div>
            )}
          </Flex>
          <Controller
            name={name}
            control={control}
            render={({ field }) => {
              const { onChange, value } = field
              return (
                <Jodit
                  id={`${name}-JoditTextArea-${selectedLanguage}`}
                  textAreaOnly
                  placeholder={placeholder}
                  onChange={onChange}
                  value={value}
                  selectedLanguage={isOpen || reloadContent ? '_suspend' : selectedLanguage}
                  platformLanguage={platformLanguage}
                  limitChars={limitChars}
                />
              )
            }}
          />
        </>
      )}
    </Flex>
  )
}

export default TextEditor
