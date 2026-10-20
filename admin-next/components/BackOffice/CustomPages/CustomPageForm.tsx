import { FieldInput, FormControl } from '@cap-collectif/form'
import { Button, Flex, FormLabel, Link } from '@cap-collectif/ui'
import TextEditor from '@components/BackOffice/Form/TextEditor/TextEditor'
import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { CustomPageFormValues } from './CustomPage.type'
import DeleteCustomPageConfirmationModal from './DeleteCustomPageConfirmationModal'

type Props = {
  pageId: string | null
  pageUrl: string | null
  currentLocale: string
  defaultLocale: string
  onSubmit: (data: CustomPageFormValues) => void
  isLoading: boolean
}

const CustomPageForm = ({ pageId, pageUrl, currentLocale, defaultLocale, onSubmit, isLoading }: Props): JSX.Element => {
  const intl = useIntl()
  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { isValid },
  } = useFormContext()
  const isNewPage = !pageId
  const defaultLocaleTitle = watch(`${defaultLocale}-title`)
  const currentBody = watch(`${currentLocale}-body`)
  const isFirstRender = React.useRef(true)

  // TextEditor stores its value with setValue() without validation: run it here so that isValid follows
  // the content. The first render is skipped to avoid flagging an empty new page before any input.
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    trigger(`${currentLocale}-body`)
  }, [currentBody, currentLocale, trigger])

  return (
    <Flex
      direction="column"
      marginTop="48px"
      spacing={6}
      bg="white"
      borderRadius="accordion"
      p={6}
      justify="space-between"
    >
      <FormControl name={`${currentLocale}-title`} control={control} key={`${currentLocale}-title`} isRequired>
        <FormLabel htmlFor={`${currentLocale}-title`} label={intl.formatMessage({ id: 'global.title' })} />
        <FieldInput type="text" id={`${currentLocale}-title`} name={`${currentLocale}-title`} control={control} />
      </FormControl>

      {pageUrl && (
        <Flex direction="column" spacing={1}>
          <FormLabel label={intl.formatMessage({ id: 'global.link' })} />
          <Link href={pageUrl} target="_blank" rel="noopener noreferrer">
            {pageUrl}
          </Link>
        </Flex>
      )}

      <FormControl name={`${currentLocale}-body`} key={`${currentLocale}-body`} control={control} isRequired>
        <TextEditor
          label={intl.formatMessage({ id: 'global.contenu' })}
          name={`${currentLocale}-body`}
          id={`${currentLocale}-body`}
          data-cy={`${currentLocale}-body`}
          placeholder={intl.formatMessage({ id: 'admin.content.start-writing' })}
          noModalAdvancedEditor
          platformLanguage={defaultLocale}
          selectedLanguage={defaultLocale}
          required
        />
      </FormControl>

      <FormControl name="isEnabled" control={control}>
        <FormLabel htmlFor="isEnabled" label={intl.formatMessage({ id: 'global.published' })} />
        <FieldInput type="switch" name="isEnabled" control={control} id="isEnabled" />
      </FormControl>

      <Flex direction="row" spacing={4}>
        <Button
          type="button"
          loading={isLoading}
          disabled={!isValid}
          onClick={e => handleSubmit(data => onSubmit(data as CustomPageFormValues))(e)}
        >
          {intl.formatMessage({ id: isNewPage ? 'btn_create' : 'global.save' })}
        </Button>
        {pageId ? (
          <DeleteCustomPageConfirmationModal title={defaultLocaleTitle} pageId={pageId} />
        ) : (
          <Button
            variant="tertiary"
            variantColor="hierarchy"
            onClick={() => (window.location.href = '/admin-next/custom-pages')}
          >
            {intl.formatMessage({ id: 'global.back' })}
          </Button>
        )}
      </Flex>
    </Flex>
  )
}

export default CustomPageForm
