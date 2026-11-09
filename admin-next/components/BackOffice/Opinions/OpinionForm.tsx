import { FieldInput, FormControl } from '@cap-collectif/form'
import { Button, CapUIFontSize, Flex, FormLabel, Heading, Text } from '@cap-collectif/ui'
import { UserListField } from '@components/BackOffice/Form/UserListField'
import TextEditor from '@components/BackOffice/Form/TextEditor/TextEditor'
import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'
import DeleteOpinionConfirmationModal from './DeleteOpinionConfirmationModal'
import { OpinionFormValues } from './Opinion.type'
import { getAppendixFieldName, OPINIONS_URL } from './utils'

type AppendixType = {
  readonly appendixTypeId: string | null
  readonly title: string | null
  readonly helpText: string | null
}

type Props = {
  opinionId: string | null
  consultationTitle: string | null
  sectionTitle: string
  appendixTypes: ReadonlyArray<AppendixType>
  onSubmit: (data: OpinionFormValues) => void
  isLoading: boolean
}

const OptionalLabel = (): JSX.Element => {
  const intl = useIntl()

  return (
    <Text as="span" fontSize={CapUIFontSize.BodySmall} color="gray.600">
      {intl.formatMessage({ id: 'global.optional' })}
    </Text>
  )
}

const OpinionForm = ({
  opinionId,
  consultationTitle,
  sectionTitle,
  appendixTypes,
  onSubmit,
  isLoading,
}: Props): JSX.Element => {
  const intl = useIntl()
  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { isSubmitted },
  } = useFormContext<OpinionFormValues>()
  const isNewOpinion = !opinionId
  const [body, answerTitle, answerAuthor, answerBody] = watch(['body', 'answerTitle', 'answerAuthor', 'answerBody'])

  // TextEditor stores its value with setValue() without validation: once the form has been submitted,
  // revalidate the rich text fields, and the answer fields which depend on each other.
  React.useEffect(() => {
    if (isSubmitted) trigger(['body', 'answerAuthor', 'answerBody'])
  }, [body, answerTitle, answerAuthor, answerBody, isSubmitted, trigger])

  return (
    <Flex direction="column" spacing="lg" bg="white" borderRadius="accordion" p="lg">
      <FormControl name="title" control={control} isRequired>
        <FormLabel htmlFor="title" label={intl.formatMessage({ id: 'global.title' })} />
        <FieldInput type="text" id="title" name="title" control={control} />
      </FormControl>

      <FormControl name="author" control={control} isRequired>
        <FormLabel htmlFor="author" label={intl.formatMessage({ id: 'global.author' })} />
        <UserListField
          control={control}
          name="author"
          id="author"
          // @ts-ignore: debounce is forwarded to the underlying FieldSelect but not part of UserListFieldProps
          debounce
          aria-autocomplete="list"
          aria-haspopup="true"
          role="combobox"
          selectFieldIsObject
        />
      </FormControl>

      <FormControl name="position" control={control}>
        <FormLabel htmlFor="position" label={intl.formatMessage({ id: 'global.position' })}>
          <OptionalLabel />
        </FormLabel>
        <FieldInput type="number" id="position" name="position" control={control} />
      </FormControl>

      {/* The opinion stays in the consultation of its type, which cannot be changed, as on the Sonata edit page */}
      <Flex direction="row" spacing="xl">
        <Flex direction="column" spacing="xxs">
          <FormLabel label={intl.formatMessage({ id: 'global.consultation' })} />
          <Text>{consultationTitle}</Text>
        </Flex>
        <Flex direction="column" spacing="xxs">
          <FormLabel label={intl.formatMessage({ id: 'global.category' })} />
          <Text>{sectionTitle}</Text>
        </Flex>
      </Flex>

      <FormControl name="body" control={control} isRequired>
        <TextEditor
          label={intl.formatMessage({ id: 'global.contenu' })}
          name="body"
          id="body"
          placeholder={intl.formatMessage({ id: 'admin.content.start-writing' })}
          noModalAdvancedEditor
          required
        />
      </FormControl>

      {appendixTypes.length > 0 ? (
        <Flex direction="column" spacing="md">
          <Heading as="h4" color="blue.800" fontWeight={600}>
            {intl.formatMessage({ id: 'admin.fields.opinion.group_appendices' })}
          </Heading>
          {appendixTypes.map(appendixType => {
            const fieldName = getAppendixFieldName(appendixType.appendixTypeId ?? '')

            return (
              <Flex direction="column" spacing="xxs" key={fieldName}>
                <FormControl name={fieldName} control={control}>
                  <TextEditor
                    label={appendixType.title ?? ''}
                    name={fieldName}
                    id={fieldName}
                    placeholder={intl.formatMessage({ id: 'admin.content.start-writing' })}
                    noModalAdvancedEditor
                  />
                </FormControl>
                {appendixType.helpText ? <Text color="gray.600">{appendixType.helpText}</Text> : null}
              </Flex>
            )
          })}
        </Flex>
      ) : null}

      <Flex direction="column" spacing="md">
        <Heading as="h4" color="blue.800" fontWeight={600}>
          {intl.formatMessage({ id: 'admin.fields.opinion.group_answer' })}
        </Heading>

        <FormControl name="answerTitle" control={control}>
          <FormLabel htmlFor="answerTitle" label={intl.formatMessage({ id: 'global.title' })}>
            <OptionalLabel />
          </FormLabel>
          <FieldInput type="text" id="answerTitle" name="answerTitle" control={control} />
        </FormControl>

        <FormControl name="answerAuthor" control={control}>
          <FormLabel htmlFor="answerAuthor" label={intl.formatMessage({ id: 'global.author' })} />
          <UserListField
            clearable
            control={control}
            name="answerAuthor"
            id="answerAuthor"
            // @ts-ignore: debounce is forwarded to the underlying FieldSelect but not part of UserListFieldProps
            debounce
            aria-autocomplete="list"
            aria-haspopup="true"
            role="combobox"
            selectFieldIsObject
          />
        </FormControl>

        <FormControl name="answerBody" control={control}>
          <TextEditor
            label={intl.formatMessage({ id: 'global.contenu' })}
            name="answerBody"
            id="answerBody"
            placeholder={intl.formatMessage({ id: 'admin.content.start-writing' })}
            noModalAdvancedEditor
            // Required as soon as the answer is started, like its author: not marked as optional
            required
          />
        </FormControl>
      </Flex>

      <Flex direction="row" spacing="md">
        <Button
          type="button"
          variantSize="small"
          loading={isLoading}
          onClick={e => handleSubmit(data => onSubmit(data))(e)}
        >
          {intl.formatMessage({ id: isNewOpinion ? 'btn_create' : 'global.save' })}
        </Button>
        {opinionId ? (
          <DeleteOpinionConfirmationModal title={watch('title')} opinionId={opinionId} />
        ) : (
          <Button
            variant="tertiary"
            variantColor="hierarchy"
            variantSize="small"
            onClick={() => (window.location.href = OPINIONS_URL)}
          >
            {intl.formatMessage({ id: 'global.back' })}
          </Button>
        )}
      </Flex>
    </Flex>
  )
}

export default OpinionForm
