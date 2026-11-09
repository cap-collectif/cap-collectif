import { Flex, Text } from '@cap-collectif/ui'
import { yupResolver } from '@hookform/resolvers/yup'
import { BreadCrumbItemType } from '@components/BackOffice/BreadCrumb/BreadCrumbItem'
import { useNavBarContext } from '@components/BackOffice/NavBar/NavBar.context'
import { buildToastUrl } from '@components/ParticipationWorkflow/utils/buildToastUrl'
import CreateOpinionAdminMutation from '@mutations/CreateOpinionAdminMutation'
import UpdateOpinionAdminMutation from '@mutations/UpdateOpinionAdminMutation'
import type {
  OpinionFormWrapper_opinion$data,
  OpinionFormWrapper_opinion$key,
} from '@relay/OpinionFormWrapper_opinion.graphql'
import type { OpinionFormWrapper_section$key } from '@relay/OpinionFormWrapper_section.graphql'
import type { OpinionFormWrapperQuery } from '@relay/OpinionFormWrapperQuery.graphql'
import type { OpinionFormWrapper_SectionQuery } from '@relay/OpinionFormWrapper_SectionQuery.graphql'
import type { TrashableStatus } from '@relay/UpdateOpinionAdminMutation.graphql'
import { isWYSIWYGContentEmpty } from '@shared/utils/isWYSIWYGContentEmpty'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import '@shared/utils/yupExtensions'
import * as React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay'
import * as yup from 'yup'
import { OpinionFormValues } from './Opinion.type'
import OpinionForm from './OpinionForm'
import OpinionFormSide from './OpinionFormSide'
import { getAppendixFieldName, NOT_TRASHED, OPINION_URL, OPINIONS_URL } from './utils'

const SECTION_FRAGMENT = graphql`
  fragment OpinionFormWrapper_section on Section {
    id
    title
    consultation {
      title
    }
    # Aliased: SectionAppendixType ids are shared with other records, Relay would merge them in its store
    appendixTypes {
      appendixTypeId: id
      title
      helpText
      position
    }
  }
`

const OPINION_FRAGMENT = graphql`
  fragment OpinionFormWrapper_opinion on Opinion {
    id
    title
    body
    position
    published
    pinned
    trashedStatus
    trashedReason
    author {
      id
      displayName
    }
    section {
      ...OpinionFormWrapper_section
    }
    appendices {
      body
      appendixTypeId
    }
    answer {
      title
      body
      author {
        id
        displayName
      }
    }
  }
`

const EDIT_QUERY = graphql`
  query OpinionFormWrapperQuery($id: ID!) {
    opinion: node(id: $id) {
      __typename
      ... on Opinion {
        ...OpinionFormWrapper_opinion
      }
    }
  }
`

const CREATE_QUERY = graphql`
  query OpinionFormWrapper_SectionQuery($opinionTypeId: ID!) {
    section: node(id: $opinionTypeId) {
      __typename
      ... on Section {
        ...OpinionFormWrapper_section
      }
    }
  }
`

const formName = 'admin_opinion'

// An emptied answer is removed: it is started as soon as one of its fields is filled
const hasAnswer = (values: Pick<OpinionFormValues, 'answerTitle' | 'answerAuthor' | 'answerBody'>): boolean =>
  Boolean(values.answerTitle?.trim()) || Boolean(values.answerAuthor) || !isWYSIWYGContentEmpty(values.answerBody ?? '')

type Props = {
  // Null on the creation page
  opinion: OpinionFormWrapper_opinion$data | null
  sectionKey: OpinionFormWrapper_section$key
}

const OpinionFormWrapper = ({ opinion, sectionKey }: Props): JSX.Element => {
  const intl = useIntl()
  const section = useFragment(SECTION_FRAGMENT, sectionKey)
  const [isLoading, setIsLoading] = React.useState(false)
  const appendixTypes = React.useMemo(
    () =>
      [...(section.appendixTypes ?? [])]
        .filter((appendixType): appendixType is NonNullable<typeof appendixType> =>
          Boolean(appendixType?.appendixTypeId),
        )
        .sort((first, second) => first.position - second.position),
    [section.appendixTypes],
  )

  const defaultValues = React.useMemo(() => {
    const values: OpinionFormValues = {
      title: opinion?.title ?? '',
      author: opinion?.author ? { label: opinion.author.displayName, value: opinion.author.id } : null,
      position: opinion?.position ?? '',
      body: opinion?.body ?? '',
      pinned: opinion?.pinned ?? false,
      trashedStatus: opinion?.trashedStatus ?? NOT_TRASHED,
      trashedReason: opinion?.trashedReason ?? '',
      answerTitle: opinion?.answer?.title ?? '',
      answerAuthor: opinion?.answer?.author
        ? { label: opinion.answer.author.displayName, value: opinion.answer.author.id }
        : null,
      answerBody: opinion?.answer?.body ?? '',
    }
    appendixTypes.forEach(({ appendixTypeId }) => {
      values[getAppendixFieldName(appendixTypeId ?? '')] =
        opinion?.appendices?.find(appendix => appendix?.appendixTypeId === appendixTypeId)?.body ?? ''
    })

    return values
  }, [opinion, appendixTypes])

  const schema = React.useMemo(() => {
    const requiredMessage = intl.formatMessage({ id: 'global.required' })

    return yup.object().shape({
      title: yup.string().notBlank(requiredMessage),
      author: yup.mixed().nullable().required(requiredMessage),
      position: yup
        .number()
        .transform((value, originalValue) => (originalValue === '' || originalValue === null ? null : value))
        .nullable()
        .integer()
        .typeError(requiredMessage),
      body: yup.string().test('not-empty', requiredMessage, value => !isWYSIWYGContentEmpty(value ?? '')),
      // The official answer is optional, but a started answer needs an author and a content, as in Sonata
      answerAuthor: yup
        .mixed()
        .nullable()
        .test('required-if-answered', requiredMessage, function (value) {
          return !hasAnswer(this.parent) || Boolean(value)
        }),
      answerBody: yup.string().test('required-if-answered', requiredMessage, function (value) {
        return !hasAnswer(this.parent) || !isWYSIWYGContentEmpty(value ?? '')
      }),
    })
  }, [intl])

  const methods = useForm<OpinionFormValues>({
    defaultValues,
    resolver: yupResolver(schema),
  })
  const { watch } = methods
  const title = watch('title')
  const { setBreadCrumbItems } = useNavBarContext()

  const breadCrumbItems = React.useMemo(
    () => [
      { title: intl.formatMessage({ id: 'admin.label.opinion' }), href: OPINIONS_URL },
      {
        title: title || intl.formatMessage({ id: 'new-proposal' }),
        href: opinion ? `${OPINION_URL}?id=${opinion.id}` : `${OPINION_URL}?opinionTypeId=${section.id}`,
      },
    ],
    [intl, title, opinion, section.id],
  )

  React.useEffect(() => {
    setBreadCrumbItems(breadCrumbItems as BreadCrumbItemType[])
    return () => setBreadCrumbItems([])
  }, [breadCrumbItems, setBreadCrumbItems])

  const getInput = (values: OpinionFormValues) => {
    const isTrashed = values.trashedStatus !== NOT_TRASHED

    return {
      title: values.title.trim(),
      body: values.body,
      author: values.author?.value ?? '',
      position: values.position === '' || values.position === null ? null : Number(values.position),
      pinned: values.pinned,
      trashedStatus: isTrashed ? (values.trashedStatus as TrashableStatus) : null,
      trashedReason: isTrashed ? values.trashedReason.trim() || null : null,
      appendices: appendixTypes.map(({ appendixTypeId }) => {
        const body = String(values[getAppendixFieldName(appendixTypeId ?? '')] ?? '')

        return { appendixTypeId: appendixTypeId ?? '', body: isWYSIWYGContentEmpty(body) ? null : body }
      }),
      answer: hasAnswer(values)
        ? {
            title: values.answerTitle.trim() || null,
            body: values.answerBody,
            author: values.answerAuthor?.value ?? '',
          }
        : null,
    }
  }

  const onSubmit = (values: OpinionFormValues) => {
    setIsLoading(true)
    const input = getInput(values)

    if (!opinion) {
      CreateOpinionAdminMutation.commit({ input: { ...input, opinionTypeId: section.id } })
        .then(response => {
          const createdOpinion = response.createOpinionAdmin?.opinion
          if (response.createOpinionAdmin?.errorCode || !createdOpinion) {
            setIsLoading(false)
            mutationErrorToast(intl)
            return
          }
          window.location.href = buildToastUrl(`${OPINION_URL}?id=${createdOpinion.id}`, {
            variant: 'success',
            message: 'admin.opinions.successfully-created',
          })
        })
        .catch(() => {
          setIsLoading(false)
          mutationErrorToast(intl)
        })
      return
    }

    UpdateOpinionAdminMutation.commit({ input: { ...input, id: opinion.id } })
      .then(response => {
        setIsLoading(false)
        if (response.updateOpinionAdmin?.errorCode) {
          mutationErrorToast(intl)
          return
        }
        successToast(intl.formatMessage({ id: 'admin.update.successful' }))
      })
      .catch(() => {
        setIsLoading(false)
        mutationErrorToast(intl)
      })
  }

  return (
    <Flex as="form" id={formName} direction="column" alignItems="flex-start" spacing="lg" noValidate>
      <FormProvider {...methods}>
        <Flex direction="row" width="100%" spacing="lg">
          <Flex direction="column" spacing="lg" width="70%">
            <OpinionForm
              opinionId={opinion?.id ?? null}
              consultationTitle={section.consultation?.title ?? null}
              sectionTitle={section.title}
              appendixTypes={appendixTypes}
              onSubmit={onSubmit}
              isLoading={isLoading}
            />
          </Flex>
          <Flex direction="column" spacing="lg" width="30%">
            <OpinionFormSide published={opinion?.published ?? null} />
          </Flex>
        </Flex>
      </FormProvider>
    </Flex>
  )
}

const NotFound = (): JSX.Element => {
  const intl = useIntl()

  return <Text>{intl.formatMessage({ id: 'page.error.not_found' })}</Text>
}

const OpinionEditForm = ({ opinionKey }: { opinionKey: OpinionFormWrapper_opinion$key }): JSX.Element => {
  const opinion = useFragment(OPINION_FRAGMENT, opinionKey)

  return <OpinionFormWrapper opinion={opinion} sectionKey={opinion.section} />
}

export const OpinionEditFormWrapper = ({ opinionId }: { opinionId: string }): JSX.Element => {
  const { opinion } = useLazyLoadQuery<OpinionFormWrapperQuery>(EDIT_QUERY, { id: opinionId })

  if (!opinion || opinion.__typename !== 'Opinion') {
    return <NotFound />
  }

  return <OpinionEditForm opinionKey={opinion} />
}

export const OpinionCreateFormWrapper = ({ opinionTypeId }: { opinionTypeId: string }): JSX.Element => {
  const { section } = useLazyLoadQuery<OpinionFormWrapper_SectionQuery>(CREATE_QUERY, { opinionTypeId })

  if (!section || section.__typename !== 'Section') {
    return <NotFound />
  }

  return <OpinionFormWrapper opinion={null} sectionKey={section} />
}

export default OpinionFormWrapper
