import { BoxProps, CapInputSize, Flex, FormLabel, Select } from '@cap-collectif/ui'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import ProjectListField from '@components/FrontOffice/Form/ProjectListField'
import { PostListSectionFiltersQuery } from '@relay/PostListSectionFiltersQuery.graphql'
import useIsMobile from '@shared/hooks/useIsMobile'
import { pxToRem } from '@shared/utils/pxToRem'
import { FC, useId } from 'react'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'

export type PostListSectionFiltersProps = {
  orderBy: string
  setOrderBy: (orderBy: string) => void
  project: string
  setProject: (author: string) => void
  theme: string
  setTheme: (theme: string) => void
}

const FILTERS_QUERY = graphql`
  query PostListSectionFiltersQuery {
    themes {
      value: id
      label: title
    }
  }
`

export const PostListSectionFilters: FC<BoxProps & PostListSectionFiltersProps> = ({
  orderBy,
  setOrderBy,
  theme,
  setTheme,
  project,
  setProject,
  ...rest
}) => {
  const { siteColors } = useAppContext()
  const { pageTitleColor } = siteColors
  const labelSx = { span: { color: pageTitleColor } }

  const orderByID = useId()
  const themeID = useId()
  const projectId = useId()
  const isMobile = useIsMobile()

  const query = useLazyLoadQuery<PostListSectionFiltersQuery>(FILTERS_QUERY, {})
  const { themes } = query
  const hasThemes = !!themes?.length

  const intl = useIntl()

  const orderOptions = [
    { label: intl.formatMessage({ id: 'global.filter_f_last' }), value: 'DESC' },
    { label: intl.formatMessage({ id: 'global.filter_f_old' }), value: 'ASC' },
  ]

  return (
    <Flex
      className="news-list-section-filters"
      flexDirection={['column', 'row']}
      gap={4}
      mb={[0]}
      flexWrap="wrap"
      alignItems="center"
      {...rest}
    >
      {hasThemes ? (
        <Flex direction="column" gap="xxs" width={['100%', 'unset']}>
          <FormLabel label={intl.formatMessage({ id: 'admin.label.theme' })} htmlFor={themeID} sx={labelSx} />
          <Select
            variantColor="hierarchy"
            variantSize={CapInputSize.Md}
            isClearable
            value={themes.find(v => v?.value === theme)}
            width={isMobile ? null : pxToRem(280)}
            options={themes}
            onChange={v => setTheme(v?.value || '')}
            id="news-theme"
            placeholder={intl.formatMessage({
              id: 'global.select_themes',
            })}
            inputId={themeID}
          />
        </Flex>
      ) : null}
      <Flex direction="column" gap="xxs" width={['100%', 'unset']}>
        <FormLabel label={intl.formatMessage({ id: 'global.project.label' })} htmlFor={projectId} sx={labelSx} />
        <ProjectListField
          variantColor="hierarchy"
          variantSize={CapInputSize.Md}
          isClearable
          value={project}
          width={isMobile ? null : pxToRem(280)}
          onChange={p => setProject(p?.value || '')}
          id="news-project"
          placeholder={intl.formatMessage({
            id: 'global.all.projects',
          })}
          inputId={projectId}
        />
      </Flex>
      <Flex direction="column" gap="xxs" width={['100%', 'unset']}>
        <FormLabel label={intl.formatMessage({ id: 'sort-by' })} htmlFor={orderByID} sx={labelSx} />
        <Select
          variantColor="hierarchy"
          variantSize={CapInputSize.Md}
          value={orderOptions.find(o => o?.value === orderBy)}
          width={isMobile ? null : pxToRem(280)}
          options={orderOptions}
          onChange={o => setOrderBy(o?.value || '')}
          id="news-orderBy"
          placeholder={intl.formatMessage({
            id: 'global.select_themes',
          })}
          inputId={orderByID}
        />
      </Flex>
    </Flex>
  )
}
