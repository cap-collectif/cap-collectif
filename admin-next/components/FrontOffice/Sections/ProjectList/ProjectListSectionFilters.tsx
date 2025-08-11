import { BoxProps, CapInputSize, Flex, FormLabel, Search, Select } from '@cap-collectif/ui'
import { ProjectListSectionFiltersQuery } from '@relay/ProjectListSectionFiltersQuery.graphql'
import useIsMobile from '@shared/hooks/useIsMobile'
import debounce from '@shared/utils/debounce-promise'
import { pxToRem } from '@shared/utils/pxToRem'
import { FC, useId } from 'react'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'
import ProjectListSectionFiltersModal from './ProjectListSectionFiltersModal'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'

type FiltersProps = {
  type: string
  setType: (type: string) => void
  state: string
  setState: (state: string) => void
  district: string
  setDistrict: (district: string) => void
  status: string
  setStatus: (status: string) => void
  orderBy: string
  setOrderBy: (orderBy: string) => void
}

export type ProjectListSectionFiltersProps = {
  term: string
  setTerm: (term: string) => void
  author: string
  setAuthor: (author: string) => void
  theme: string
  setTheme: (theme: string) => void
} & FiltersProps

const FILTERS_QUERY = graphql`
  query ProjectListSectionFiltersQuery {
    ...ProjectListSectionFiltersModal_query
    themes {
      value: id
      label: title
    }
    projectAuthors {
      value: id
      label: username
    }
  }
`

export const ProjectListSectionFilters: FC<BoxProps & ProjectListSectionFiltersProps> = ({
  term,
  setTerm,
  orderBy,
  setOrderBy,
  author,
  setAuthor,
  type,
  setType,
  state,
  setState,
  theme,
  setTheme,
  district,
  setDistrict,
  status,
  setStatus,
  ...rest
}) => {
  const { siteColors } = useAppContext()
  const { pageTitleColor } = siteColors
  const searchID = useId()
  const themeID = useId()
  const authorID = useId()
  const isMobile = useIsMobile()

  const labelSx = { span: { color: pageTitleColor } }

  const query = useLazyLoadQuery<ProjectListSectionFiltersQuery>(FILTERS_QUERY, {})
  const { themes, projectAuthors } = query
  const hasThemes = !!themes?.length
  const hasAuthors = !!projectAuthors?.length

  const intl = useIntl()

  const onTermChange = debounce((value: string) => {
    setTerm(value)
  }, 1000)

  const renderFilters = () => (
    <ProjectListSectionFiltersModal
      type={type}
      setType={setType}
      state={state}
      setState={setState}
      district={district}
      setDistrict={setDistrict}
      status={status}
      setStatus={setStatus}
      orderBy={orderBy}
      setOrderBy={setOrderBy}
      query={query}
    />
  )

  return (
    <Flex
      className="project-list-section-filters"
      alignItems={['stretch', 'center']}
      justifyContent="space-between"
      flexDirection={['column', 'row']}
      px={['md', 0]}
      {...rest}
    >
      <Flex gap={4} mb={['lg', 0]} flexWrap="wrap" alignItems="end">
        <Flex direction="column" gap="xxs" width={['100%', 'unset']}>
          <FormLabel label={intl.formatMessage({ id: 'global.menu.search' })} htmlFor={searchID} sx={labelSx} />
          <Search
            id="search-in-project-list-by-title"
            variantSize={CapInputSize.Md}
            placeholder={intl.formatMessage({ id: 'project-list.search_placeholder' })}
            onChange={onTermChange}
            value={term}
            inputId={searchID}
            width={isMobile ? '100%' : null}
          />
        </Flex>
        {hasThemes ? (
          <Flex direction="column" gap="xxs" width={['100%', 'unset']}>
            <FormLabel label={intl.formatMessage({ id: 'admin.label.theme' })} htmlFor={themeID} sx={labelSx} />
            <Select
              variantSize={CapInputSize.Md}
              isClearable
              value={themes.find(v => v?.value === theme)}
              width={isMobile ? null : pxToRem(280)}
              options={themes}
              onChange={v => setTheme(v?.value || '')}
              id="project-theme"
              placeholder={intl.formatMessage({
                id: 'global.select_themes',
              })}
              inputId={themeID}
            />
          </Flex>
        ) : null}
        {hasAuthors ? (
          <Flex direction="column" gap="xxs" width={['100%', 'unset']}>
            <FormLabel label={intl.formatMessage({ id: 'global.author' })} htmlFor={authorID} sx={labelSx} />
            <Select
              variantSize={CapInputSize.Md}
              isClearable
              value={projectAuthors.find(v => v?.value === author)}
              width={isMobile ? null : pxToRem(280)}
              options={projectAuthors}
              onChange={v => setAuthor(v?.value || '')}
              id="project-author"
              placeholder={intl.formatMessage({
                id: 'all-the-authors',
              })}
              inputId={authorID}
            />
          </Flex>
        ) : null}
        {!isMobile ? renderFilters() : null}
      </Flex>
      {isMobile ? <Flex>{renderFilters()}</Flex> : null}
    </Flex>
  )
}
