import * as React from 'react'
import { useIntl } from 'react-intl'
import {
  Button,
  ButtonGroup,
  CapUIFontSize,
  CapUIModalSize,
  Flex,
  FlexProps,
  FormLabel,
  Heading,
  InputProps,
  Modal,
  Text,
} from '@cap-collectif/ui'
import Jodit from './Jodit'
import { Controller, useFormContext } from 'react-hook-form'

export type TextEditorProps = FlexProps & {
  labelId?: string
  label: string
  name: string
  placeholder?: string
  required?: boolean
  selectedLanguage?: string
  platformLanguage?: string
  disabled?: boolean
  buttonLabels?: {
    cancel?: string
    submit?: string
  }
  limitChars?: number
  clientConfig?: boolean
  advancedEditor?: boolean
  noModalAdvancedEditor?: boolean
  variantColor?: InputProps['variantColor']
  // Id of the error message rendered by the surrounding FormControl: when given, the field validation state is
  // exposed on the editable area (aria-invalid, aria-describedby)
  errorId?: string
}

const TextEditor: React.FC<TextEditorProps> = ({
  label,
  labelId,
  name,
  placeholder,
  required = false,
  selectedLanguage = 'fr',
  platformLanguage = 'fr',
  buttonLabels,
  limitChars,
  clientConfig,
  advancedEditor = true,
  noModalAdvancedEditor = false,
  disabled,
  variantColor = 'default',
  errorId,
  ...rest
}) => {
  const intl = useIntl()
  const [isOpen, setIsOpen] = React.useState(false)
  const [reloadContent, setReloadContent] = React.useState(false)
  const { control, setValue, watch, getFieldState, formState } = useFormContext()
  const value = watch(name)
  const { error, isTouched } = getFieldState(name, formState)
  // Same rule as FormControl, which displays the error message: in onChange mode, only once the field is touched
  const isInvalid = !!errorId && !!error && (control._options.mode !== 'onChange' || isTouched)

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
          <FormLabel id={labelId} htmlFor={name} label={label}>
            {required ? null : (
              <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
                {intl.formatMessage({ id: 'global.optional' })}
              </Text>
            )}
          </FormLabel>
          <Jodit
            id={`${name}-JoditModal-${selectedLanguage}`}
            placeholder={placeholder}
            // Revalidate only an invalid field, so that its error disappears once it is filled
            onChange={value => setValue(name, value, { shouldValidate: !!getFieldState(name).error })}
            value={value}
            selectedLanguage={selectedLanguage}
            platformLanguage={platformLanguage}
            limitChars={limitChars}
            clientConfig={clientConfig}
            disabled={disabled}
            labelId={labelId}
            required={required}
            invalid={isInvalid}
            errorId={errorId}
          />
        </>
      )}

      {!noModalAdvancedEditor && (
        <>
          <Flex justify="space-between" mb={1}>
            <FormLabel id={labelId} htmlFor={name} label={label}>
              {required ? null : (
                <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
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
                      clientConfig={clientConfig}
                      disabled={disabled}
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
                  clientConfig={clientConfig}
                  disabled={disabled}
                  variantColor={variantColor}
                  labelId={labelId}
                  required={required}
                  invalid={isInvalid}
                  errorId={errorId}
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
