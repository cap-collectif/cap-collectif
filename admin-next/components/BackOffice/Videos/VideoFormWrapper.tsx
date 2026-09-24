import * as React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { graphql, GraphQLTaggedNode, useLazyLoadQuery } from 'react-relay'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import '@shared/utils/yupExtensions'
import { Flex } from '@cap-collectif/ui'
import { BreadCrumbItemType } from '@components/BackOffice/BreadCrumb/BreadCrumbItem'
import { useNavBarContext } from '@components/BackOffice/NavBar/NavBar.context'
import CreateVideoMutation from '@mutations/CreateVideoMutation'
import UpdateVideoMutation from '@mutations/UpdateVideoMutation'
import { dangerToast, mutationErrorToast, successToast } from '@shared/utils/toasts'
import { VideoFormWrapperQuery, VideoFormWrapperQuery$data } from '@relay/VideoFormWrapperQuery.graphql'
import { VideoFormWrapper_ViewerQuery } from '@relay/VideoFormWrapper_ViewerQuery.graphql'
import { Locale, VideoFormValues } from './Video.type'
import VideoForm from './VideoForm'

type VideoFormWrapperProps = {
  videoId?: string
  videoData?: VideoFormWrapperQuery$data
}

type VideoFormWrapperWithDataProps = {
  videoId: string
}

export const QUERY: GraphQLTaggedNode = graphql`
  query VideoFormWrapperQuery($id: ID!) {
    video(id: $id) {
      id
      link
      isEnabled
      position
      author {
        id
        displayName
      }
      media {
        id
        name
        size
        type: contentType
        url(format: "reference")
      }
      translations {
        locale
        title
        body
      }
    }
  }
`

export const VIEWER_QUERY = graphql`
  query VideoFormWrapper_ViewerQuery {
    platformLocales: availableLocales(includeDisabled: false) {
      code
      id
      isDefault
      traductionKey
    }
  }
`

const formName = 'admin_video_create'

const VideoFormWrapper = ({ videoId, videoData }: VideoFormWrapperProps): JSX.Element => {
  const intl = useIntl()
  const isNewVideo = !videoId
  const [isLoading, setIsLoading] = React.useState(false)
  const { platformLocales } = useLazyLoadQuery<VideoFormWrapper_ViewerQuery>(VIEWER_QUERY, {})
  const defaultLocale = platformLocales.find(locale => locale.isDefault) ?? platformLocales[0]

  const getInitialValues = () => {
    if (isNewVideo) {
      return {
        link: '',
        author: null,
        media: null,
        isEnabled: true,
        position: 0,
        currentLocale: defaultLocale.code,
      }
    }
    return {
      link: videoData?.video?.link ?? '',
      author: videoData?.video?.author
        ? { label: videoData.video.author.displayName, value: videoData.video.author.id }
        : null,
      media: videoData?.video?.media ?? null,
      isEnabled: videoData?.video?.isEnabled ?? true,
      position: videoData?.video?.position ?? 0,
      currentLocale: defaultLocale.code,
    }
  }

  const defaultValues = getInitialValues()

  if (videoData?.video?.translations) {
    videoData.video.translations.forEach(translation => {
      defaultValues[`${translation.locale}-title`] = translation.title ?? ''
      defaultValues[`${translation.locale}-body`] = translation.body ?? ''
    })
  }

  const requiredMessage = intl.formatMessage({ id: 'global.required' })

  const methods = useForm<VideoFormValues>({
    mode: 'onChange',
    defaultValues,
    resolver: yupResolver(
      (() => {
        const defaultCode = defaultLocale?.code ?? platformLocales?.[0]?.code
        const localeFields: Record<string, yup.AnySchema> = {}
        if (defaultCode) {
          localeFields[`${defaultCode}-title`] = yup.string().notBlank(requiredMessage)
        }

        return yup.object().shape({
          ...localeFields,
          link: yup.string().notBlank(requiredMessage),
          position: yup.number().typeError(requiredMessage).required(requiredMessage),
        })
      })(),
    ),
  })

  const { watch, getValues } = methods
  // @ts-ignore: the input name is dynamically generated and is thus not typed
  const title = watch(`${defaultLocale.code}-title`)
  const { setBreadCrumbItems } = useNavBarContext()

  const breadCrumbItems = React.useMemo(() => {
    return [
      {
        title: intl.formatMessage({ id: 'admin.label.video' }),
        href: '/admin-next/videos',
      },
      {
        title: title || intl.formatMessage({ id: 'admin.videos.new' }),
        href: videoId ? `video?id=${videoId}` : 'video',
      },
    ]
  }, [intl, title, videoId])

  React.useEffect(() => {
    setBreadCrumbItems(breadCrumbItems as BreadCrumbItemType[])
    return () => setBreadCrumbItems([])
  }, [breadCrumbItems, setBreadCrumbItems])

  const formatTranslations = () => {
    const translations = []
    platformLocales.forEach(locale => {
      // @ts-ignore: the input name is dynamically generated and is thus not typed
      const localeTitle = getValues(`${locale.code}-title`)
      if (localeTitle) {
        translations.push({
          locale: locale.code,
          title: localeTitle,
          // @ts-ignore: same reason
          body: getValues(`${locale.code}-body`) ?? null,
        })
      }
    })
    return translations
  }

  const onSubmit = (data: VideoFormValues) => {
    setIsLoading(true)

    const input = {
      link: data.link,
      author: data.author?.value ?? null,
      media: data.media?.id ?? null,
      isEnabled: data.isEnabled,
      position: data.position,
      translations: formatTranslations(),
    }

    if (isNewVideo) {
      CreateVideoMutation.commit({ input })
        .then(response => {
          if (response.createVideo.errorCode) {
            dangerToast(intl.formatMessage({ id: 'global.saving.error' }))
            setIsLoading(false)
            return
          }
          successToast(intl.formatMessage({ id: 'admin.videos.successfully-created' }))
          const newVideoId = response?.createVideo?.video?.id
          window.location.href = `video?id=${newVideoId}`
        })
        .catch(() => {
          mutationErrorToast(intl)
        })
    } else {
      UpdateVideoMutation.commit({ input: { ...input, id: videoId } })
        .then(response => {
          if (response.updateVideo.errorCode) {
            dangerToast(intl.formatMessage({ id: 'global.saving.error' }))
            setIsLoading(false)
            return
          }
          successToast(intl.formatMessage({ id: 'admin.update.successful' }))
          setIsLoading(false)
        })
        .catch(() => {
          mutationErrorToast(intl)
        })
    }
  }

  return (
    <Flex as="form" id={formName} direction="column" alignItems="flex-start" spacing={6} width="100%">
      <FormProvider {...methods}>
        <Flex direction="column" spacing={6} width="100%">
          <VideoForm
            isNewVideo={isNewVideo}
            videoId={isNewVideo ? null : videoId}
            onSubmit={onSubmit}
            isLoading={isLoading}
            formName={formName}
            availableLocales={platformLocales as Locale[]}
          />
        </Flex>
      </FormProvider>
    </Flex>
  )
}

export default VideoFormWrapper

export const VideoFormWrapperWithData = ({ videoId }: VideoFormWrapperWithDataProps): JSX.Element => {
  const node = useLazyLoadQuery<VideoFormWrapperQuery>(QUERY, {
    id: videoId,
  })

  return <VideoFormWrapper videoData={node} videoId={videoId} />
}
