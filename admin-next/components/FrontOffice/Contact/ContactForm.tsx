import { Box, Button, CapInputSize, CapUIFontSize, CapUILineHeight, FormLabel, Text, toast } from '@cap-collectif/ui'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import SendContactFormMutation from '@mutations/SendContactFormMutation'
import { pageContactContentQuery$data } from '@relay/pageContactContentQuery.graphql'
import { SendContactFormMutation$variables } from '@relay/SendContactFormMutation.graphql'
import { FieldInput, FormControl } from '@shared/cap-collectif/form/src'
import Captcha from '@shared/form/Captcha'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import { FC } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

type FormData = SendContactFormMutation$variables['input']

export const ContactForm: FC<{
  form: pageContactContentQuery$data['contactForms'][0]
  variantSize?: CapInputSize
}> = ({ form, variantSize = CapInputSize.Md }) => {
  const intl = useIntl()
  const { viewerSession } = useAppContext()
  const captcha = useFeatureFlag('captcha')

  const defaultValues = { name: viewerSession?.username || '', email: viewerSession?.email, title: '', body: '' }

  const methods = useForm<FormData>({
    mode: 'onSubmit',
    defaultValues,
  })

  const {
    control,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods

  const onSubmit = async (values: FormData) => {
    await SendContactFormMutation.commit({
      input: { ...values, idContactForm: form.id },
    })
      .then(() => {
        reset(defaultValues)
        toast({ content: intl.formatMessage({ id: 'contact.email.sent_success' }), variant: 'success' })
        return
      })
      .catch(() => {
        return mutationErrorToast(intl)
      })
  }

  return (
    <form id={`contact-form-${form.id}`} onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormControl control={control} name="name" variantSize={variantSize} mb="lg">
        <FormLabel htmlFor="name" label={intl.formatMessage({ id: 'global.name' })}>
          <Text fontSize={CapUIFontSize.BodySmall} color="text.tertiary">
            {intl.formatMessage({ id: 'global.optional' })}
          </Text>
        </FormLabel>
        <FieldInput name="name" control={control} type="text" minLength={2} />
      </FormControl>
      <FormControl control={control} name="email" isRequired variantSize={variantSize} mb="lg">
        <FormLabel htmlFor="email" label={intl.formatMessage({ id: 'global.email' })} />
        <FieldInput
          name="email"
          control={control}
          type="email"
          placeholder={intl.formatMessage({ id: 'email.placeholder' })}
        />
      </FormControl>
      <FormControl control={control} name="title" isRequired variantSize={variantSize} mb="lg">
        <FormLabel htmlFor="title" label={intl.formatMessage({ id: 'object' })} />
        <FieldInput
          name="title"
          control={control}
          type="text"
          minLength={2}
          placeholder={intl.formatMessage({ id: 'placeholder.object' })}
        />
      </FormControl>
      <FormControl control={control} name="body" isRequired variantSize={variantSize}>
        <FormLabel htmlFor="body" label={intl.formatMessage({ id: 'contact.your-message' })} />
        <FieldInput
          name="body"
          control={control}
          type="textarea"
          minLength={2}
          required
          placeholder={intl.formatMessage({ id: 'contact_form.message' })}
        />
      </FormControl>
      {captcha ? (
        <Box my="lg">
          <FormProvider {...methods}>
            <Captcha name="captcha" required />
          </FormProvider>
        </Box>
      ) : null}
      <Button
        isLoading={isSubmitting}
        variantSize="big"
        variantColor="primary"
        width={['100%', 'auto']}
        justifyContent="center"
        type="submit"
      >
        {intl.formatMessage({ id: 'global.send' })}
      </Button>
      {form.confidentiality ? (
        <Text fontSize={CapUIFontSize.Caption} lineHeight={CapUILineHeight.S} mt="lg" as="div">
          <WYSIWYGRender value={form.confidentiality} />
        </Text>
      ) : null}
    </form>
  )
}

export default ContactForm
