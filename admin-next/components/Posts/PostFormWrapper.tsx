import * as React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Flex, toast } from '@cap-collectif/ui'
import PostFormSide from './PostFormSide'
import PostForm from './PostForm'
import { useLazyLoadQuery, graphql, GraphQLTaggedNode } from 'react-relay'
import { PostFormWrapperQuery, PostFormWrapperQuery$data } from '@relay/PostFormWrapperQuery.graphql'
import { PostFormWrapper_OrganizationQuery } from '@relay/PostFormWrapper_OrganizationQuery.graphql'
import { PostFormWrapper_ProposalQuery } from '@relay/PostFormWrapper_ProposalQuery.graphql'
import moment from 'moment'
import { PostFormValues, RelatedContent, Locale } from './Post.type'
import { Option } from '@components/Projects/ProjectConfig/ProjectConfigForm.utils'
import { useIntl } from 'react-intl'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import CreatePostMutation from '@mutations/CreatePostMutation'
import UpdatePostMutation from '@mutations/UpdatePostMutation'
import { useAppContext } from '@components/AppProvider/App.context'
import useUrlState from '@hooks/useUrlState'
import { useNavBarContext } from '@components/NavBar/NavBar.context'
import { BreadCrumbItemType } from '@components/BreadCrumb/BreadCrumbItem'
import { getSelectedOptions } from './utils'

type PostFormWrapperProps = {
  postId?: string
  postData?: PostFormWrapperQuery$data
}

type PostFormWrapperWithDataProps = {
  postId: string
}

export const QUERY: GraphQLTaggedNode = graphql`
  query PostFormWrapperQuery($id: ID!) {
    post: node(id: $id) {
      ... on Post {
        id
        title
        authors {
          id
          username
        }
        abstract
        body
        media {
          id
          name
          size
          type: contentType
          url(format: "reference")
        }
        isPublished
        publishedAt
        commentable
        displayedOnBlog
        translations {
          locale
          title
          body
          abstract
          metaDescription
        }
        metaDescription
        customCode
        relatedContent {
          __typename
          ... on Project {
            id
            title
          }
          ... on Proposal {
            id
            title
          }
          ... on Theme {
            id
            title
          }
        }
      }
    }
  }
`

export const ORGANIZATION_QUERY = graphql`
  query PostFormWrapper_OrganizationQuery {
    platformLocales: availableLocales(includeDisabled: false) {
      code
      id
      isDefault
      traductionKey
    }
    viewer {
      id
      username
      isAdmin
      isProjectAdmin
      organizations {
        id
        displayName
      }
    }
  }
`

export const PROPOSAL_QUERY = graphql`
  query PostFormWrapper_ProposalQuery($id: ID!) {
    proposalObject: node(id: $id) {
      id
      ... on Proposal {
        title
        __typename
      }
    }
  }
`

const formName = 'admin_post_create'

const PostFormWrapper = ({ postId, postData }: PostFormWrapperProps): JSX.Element => {
  const intl = useIntl()
  const { viewerSession } = useAppContext()
  const isNewPost = !postId
  const [proposalIdFromUrl] = useUrlState('proposalId', '')
  const { proposalObject } = useLazyLoadQuery<PostFormWrapper_ProposalQuery>(PROPOSAL_QUERY, {
    id: proposalIdFromUrl,
  })

  const { isOrganizationMember, isAdmin, isProjectAdmin } = viewerSession
  const [isLoading, setIsLoading] = React.useState(false)
  const { platformLocales, viewer } = useLazyLoadQuery<PostFormWrapper_OrganizationQuery>(ORGANIZATION_QUERY, {})

  const organization = viewer.organizations?.[0]
  const defaultAuthor = organization
    ? { label: organization.displayName, value: organization.id }
    : { label: viewer.username, value: viewer.id }

  const defaultLocale = platformLocales.find(locale => locale.isDefault)
  const [currentLocale, setCurrentLocale] = React.useState<string>(defaultLocale.code)

  let authors = postData?.post?.authors?.map(author => ({ value: author.id, label: author.username })) || [
    defaultAuthor,
  ]

  // Note: readonly field - is an array of only one ID
  const selectedProposal: Option[] = proposalObject
    ? [{ label: proposalObject.title, value: proposalObject.id }]
    : getSelectedOptions(postData?.post?.relatedContent as RelatedContent[], 'Proposal')

  const selectedThemes: Option[] = getSelectedOptions(postData?.post?.relatedContent as RelatedContent[], 'Theme')

  const selectedProjects: Option[] = getSelectedOptions(postData?.post?.relatedContent as RelatedContent[], 'Project')

  const getInitialValues = () => {
    if (isNewPost) {
      return {
        title: '',
        authors: authors,
        abstract: '',
        media: null,
        body: '',
        themes: [],
        projects: [],
        displayedOnBlog: !isOrganizationMember,
        publishedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        isPublished: false,
        commentable: false,
        translations: [],
        currentLocale: defaultLocale.code,
        metaDescription: '',
        customCode: '',
        locales: platformLocales.map(locale => locale.code),
      }
    }
    return {
      title: postData?.post?.title ?? '',
      authors: authors,
      abstract: postData?.post?.abstract ?? '',
      media: postData?.post?.media ?? null,
      body: postData?.post?.body ?? '',
      themes: selectedThemes || [],
      projects: selectedProjects || [],
      displayedOnBlog:
        postData?.post?.displayedOnBlog ?? isAdmin ? true : isOrganizationMember || isProjectAdmin ? false : true,
      publishedAt:
        moment(postData?.post?.publishedAt).format('YYYY-MM-DD HH:mm:ss') || moment().format('YYYY-MM-DD HH:mm:ss'),
      isPublished: postData?.post?.isPublished || false,
      commentable: postData?.post?.commentable || false,
      currentLocale: defaultLocale.code,
      metaDescription: postData?.post?.metaDescription || '',
      customCode: postData?.post?.customCode || '',
    }
  }

  const defaultValues = getInitialValues()

  if (postData?.post?.translations) {
    postData?.post?.translations.map(trans => {
      defaultValues[`${trans.locale}-title`] = trans.title ?? ''
      defaultValues[`${trans.locale}-abstract`] = trans.abstract ?? ''
      defaultValues[`${trans.locale}-body`] = trans.body ?? ''
      defaultValues[`${trans.locale}-metaDescription`] = trans.metaDescription ?? ''
    })
  }

  const methods = useForm<PostFormValues>({
    mode: 'onChange',
    defaultValues,
  })

  const { watch, getValues } = methods

  // @ts-ignore: the input name is dynamically generated and is thus not typed
  const title = watch(`${currentLocale}-title`)
  const { setBreadCrumbItems } = useNavBarContext()

  const breadCrumbItems = React.useMemo(() => {
    return [
      {
        title: intl.formatMessage({ id: 'global.articles' }),
        href: '/admin-next/posts',
      },
      {
        title: title ?? intl.formatMessage({ id: 'admin.post.title' }),
        href: postId ? `post?id=${postId}` : 'post',
      },
    ]
  }, [intl, title, postId])

  React.useEffect(() => {
    setBreadCrumbItems(breadCrumbItems as BreadCrumbItemType[])
    return () => setBreadCrumbItems([])
  }, [breadCrumbItems, setBreadCrumbItems])

  const formatTranslations = () => {
    const locales = platformLocales.map(locale => locale.code)
    const translations = []
    let currentIndex = 0
    locales.map(locale => {
      // @ts-ignore: the input name is dynamically generated and is thus not typed
      if (getValues(`${locale}-title`)) {
        translations[currentIndex] = {
          locale: locale,
          // @ts-ignore: same reason
          title: getValues(`${locale}-title`) ?? null,
          // @ts-ignore: same reason
          abstract: getValues(`${locale}-abstract`) ?? null,
          // @ts-ignore: same reason
          body: getValues(`${locale}-body`) ?? null,
          // @ts-ignore: same reason
          metaDescription: getValues(`${locale}-metaDescription`) ?? null,
        }
        currentIndex = currentIndex + 1
        return
      }
    })
    return translations
  }

  const onSubmit = (data: PostFormValues) => {
    setIsLoading(true)

    const owner = data?.authors?.[0].value ?? null

    const input = {
      authors: data.authors.map(author => author.value),
      media: data?.media?.id || null,
      themes: data.themes.map(theme => theme.value),
      projects: data.projects.map(project => project.value),
      displayedOnBlog: data.displayedOnBlog,
      publishedAt: moment(data.publishedAt).format('YYYY-MM-DD HH:mm:ss'),
      isPublished: data.isPublished,
      commentable: data.commentable,
      translations: formatTranslations(),
      customCode: data.customCode,
      proposals: selectedProposal.length > 0 ? [selectedProposal[0].value] : [],
    }

    if (isNewPost) {
      input['owner'] = owner
      return CreatePostMutation.commit({
        input,
      })
        .then(response => {
          if (response.createPost.errorCode) {
            toast({
              variant: 'danger',
              content: intl.formatMessage({ id: 'global.saving.error' }),
            })
            setIsLoading(false)
            return
          }
          toast({
            variant: 'success',
            content: intl.formatMessage({ id: 'post-successfully-created' }),
          })
          const newPostId = response?.createPost?.post?.id
          window.location.href = `post?id=${newPostId}`
        })
        .catch(() => {
          mutationErrorToast(intl)
        })
    } else {
      UpdatePostMutation.commit({
        input: {
          ...input,
          id: postId,
        },
      })
        .then(response => {
          if (response.updatePost.errorCode) {
            if (response.updatePost.errorCode === 'INVALID_FORM') {
              toast({
                variant: 'danger',
                content: intl.formatMessage({ id: 'invalid-model' }),
              })
            } else {
              toast({
                variant: 'danger',
                content: intl.formatMessage({ id: 'global.saving.error' }),
              })
            }
            setIsLoading(false)
            return
          }
          toast({
            variant: 'success',
            content: intl.formatMessage({ id: 'post-successfully-updated' }),
          })
          setIsLoading(false)
        })
        .catch(() => {
          mutationErrorToast(intl)
        })
    }
  }

  return (
    <Flex as="form" id={formName} direction="column" alignItems="flex-start" spacing={6}>
      <FormProvider {...methods}>
        <Flex direction="row" width="100%" spacing={6}>
          <Flex direction="column" spacing={6} width="70%">
            <PostForm
              isNewPost={isNewPost}
              postId={isNewPost ? null : postId}
              onSubmit={onSubmit}
              defaultLocale={defaultLocale.code}
              isLoading={isLoading}
              formName={formName}
            />
          </Flex>
          <Flex direction="column" spacing={6} width="30%">
            <PostFormSide
              selectedProposal={selectedProposal}
              availableLocales={platformLocales as Locale[]}
              currentLocale={currentLocale}
              setCurrentLocale={setCurrentLocale}
            />
          </Flex>
        </Flex>
      </FormProvider>
    </Flex>
  )
}

export default PostFormWrapper

export const PostFormWrapperWithData = ({ postId }: PostFormWrapperWithDataProps): JSX.Element => {
  const node = useLazyLoadQuery<PostFormWrapperQuery>(QUERY, {
    id: postId,
  })

  return <PostFormWrapper postData={node} postId={postId} />
}
