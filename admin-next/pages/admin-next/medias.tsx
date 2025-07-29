import * as React from 'react'
import { graphql, PreloadedQuery, usePreloadedQuery, useQueryLoader } from 'react-relay'
import { useIntl } from 'react-intl'
import { Button, CapUIIcon, CapUIIconSize, Flex, Search, Spinner, toast } from '@cap-collectif/ui'
import { NextPage } from 'next'
import { PageProps } from 'types'
import TablePlaceholder from '@ui/Table/TablePlaceholder'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import type { mediasQuery as mediasQueryType } from '@relay/mediasQuery.graphql'
import MediaList from '@components/BackOffice/Medias/MediaList'
import Layout from '@components/BackOffice/Layout/Layout'
import { View } from '@components/BackOffice/Medias/utils'
import DropzoneWrapper from '@components/BackOffice/Dropzone/DropzoneWrapper'
import { ALLOWED_MIMETYPES, MAX_FILE_SIZE } from '@shared/utils/acceptedFiles'
import Fetcher, { json } from '@utils/fetch'
import debounce from '@shared/utils/debounce-promise'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import { useSearchParams } from 'next/navigation'
import { FileRejection } from 'react-dropzone'
import ViewButton from '@ui/ViewButton/ViewButton'

export const MediaListPageQuery = graphql`
  query mediasQuery($count: Int!, $cursor: String, $term: String) {
    ...MediaList_query @arguments(count: $count, cursor: $cursor, term: $term)
  }
`

const MediaListPage: React.FC<{ queryReference: PreloadedQuery<mediasQueryType> }> = ({ queryReference }) => {
  const intl = useIntl()
  const params = useSearchParams()
  const search = params.get('uploaded')
  const initialView = params.get('view')
  const [isUploadingLength, setIsUploadingLength] = React.useState(0)
  const [term, setTerm] = React.useState<string>('')
  const [view, setView] = React.useState<View>(initialView === 'LIST' ? 'LIST' : 'GRID')
  const query = usePreloadedQuery<mediasQueryType>(MediaListPageQuery, queryReference)
  const onTermChange = debounce((value: string) => setTerm(value), 400)

  React.useEffect(() => {
    if (search === 'OK') {
      toast({ variant: 'success', content: intl.formatMessage({ id: 'files-uploaded' }) })
      window.history.pushState('', '', '/admin-next/medias')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onDrop = async (acceptedFiles: Array<File>) => {
    setIsUploadingLength(acceptedFiles.length)
    const promisesUpload = acceptedFiles.map(file => {
      const formData = new FormData()
      formData.append('file', file)
      return Fetcher.postFormData('/files', formData)
        .then(json)
        .then(res => ({
          id: res.id,
          name: res.name,
          size: res.size,
          url: res.url,
        }))
    })
    await Promise.all(promisesUpload)
      .then(() => {
        // For now the upload is still in rest so we cannot put the uploaded files in our list, therefore
        // we have to reload the page, but we keep the view
        window.location.search += `?uploaded=OK&view=${view}`
      })
      .catch(() => mutationErrorToast(intl))
  }

  const onError = async (rejectedFiles: FileRejection[]) => {
    const { code } = rejectedFiles?.[0].errors?.[0]
    const { name, size, type } = rejectedFiles?.[0].file
    switch (code) {
      case 'file-invalid-type':
      case 'file-too-large':
        toast({
          variant: 'danger',
          content: intl.formatMessage(
            { id: code },
            { fileName: name, extension: type, size: (size / 1000000).toFixed(2) },
          ),
        })
        break
      default:
        mutationErrorToast(intl)
    }
  }

  return (
    <DropzoneWrapper
      accept={ALLOWED_MIMETYPES}
      maxSize={MAX_FILE_SIZE}
      multiple
      onDropRejected={onError}
      onDropAccepted={onDrop}
    >
      <Flex direction="column" p={8} spacing={4} bg="white" borderRadius="normal" overflow="hidden">
        <Flex direction="row" spacing={6}>
          <DropzoneWrapper
            accept={ALLOWED_MIMETYPES}
            maxSize={MAX_FILE_SIZE}
            multiple
            onDropRejected={onError}
            onDropAccepted={onDrop}
            mode="click"
          >
            <Button
              data-cy="create-media-button"
              variant="primary"
              variantColor="primary"
              variantSize="small"
              leftIcon={CapUIIcon.Add}
              onClick={() => {}}
            >
              {intl.formatMessage({ id: 'global.add' })}
            </Button>
          </DropzoneWrapper>
          <Search
            id="search-medias"
            onChange={onTermChange}
            value={term}
            placeholder={intl.formatMessage({ id: 'vote.step.search' })}
          />
          <Flex position="relative" flex="none" borderRadius="normal">
            <ViewButton
              onClick={() => setView('LIST')}
              active={view === 'LIST'}
              icon={CapUIIcon.List}
              borderTopLeftRadius="normal"
              borderBottomLeftRadius="normal"
              borderRight={view === 'LIST' ? 'normal' : 'none'}
            >
              {intl.formatMessage({ id: 'global.list' })}
            </ViewButton>
            <ViewButton
              onClick={() => setView('GRID')}
              active={view === 'GRID'}
              icon={CapUIIcon.PictureO}
              borderTopRightRadius="normal"
              borderBottomRightRadius="normal"
              borderLeft={view === 'GRID' ? 'normal' : 'none'}
            >
              {intl.formatMessage({ id: 'grid' })}
            </ViewButton>
          </Flex>
        </Flex>
        <React.Suspense fallback={<TablePlaceholder rowsCount={20} columnsCount={6} />}>
          <MediaList
            query={query}
            onReset={() => setTerm('')}
            view={view}
            term={term}
            isUploadingLength={isUploadingLength}
          />
        </React.Suspense>
      </Flex>
    </DropzoneWrapper>
  )
}

const Medias: NextPage<PageProps> = () => {
  const intl = useIntl()

  const [queryReference, loadQuery, disposeQuery] = useQueryLoader<mediasQueryType>(MediaListPageQuery)
  React.useEffect(() => {
    loadQuery({
      count: 50,
      cursor: null,
      term: null,
    })

    return () => {
      disposeQuery()
    }
  }, [disposeQuery, loadQuery])

  return (
    <Layout navTitle={intl.formatMessage({ id: 'global.medias' })}>
      {queryReference ? (
        <React.Suspense
          fallback={
            <Flex alignItems="center" justifyContent="center">
              <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
            </Flex>
          }
        >
          <MediaListPage queryReference={queryReference} />
        </React.Suspense>
      ) : null}
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default Medias
