import * as React from 'react'
import { FormProvider, useFormContext } from 'react-hook-form'
import { CapUIFontSize, CapUIIcon, Flex, FormLabel, Heading, Icon, Link, Text, UPLOADER_SIZE } from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { ProjectConfigFormGeneral_query$key } from '@relay/ProjectConfigFormGeneral_query.graphql'
import { ProjectConfigFormGeneral_project$key } from '@relay/ProjectConfigFormGeneral_project.graphql'
import TextEditor from 'components/BackOffice/Form/TextEditor/TextEditor'
import UserListField from '../../Form/UserListField'
import { UPLOAD_PATH } from '@utils/config'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'

export interface ProjectConfigFormGeneralProps {
  query: ProjectConfigFormGeneral_query$key
  project: ProjectConfigFormGeneral_project$key | null
}

const QUERY_FRAGMENT = graphql`
  fragment ProjectConfigFormGeneral_query on Query {
    viewer {
      isAdmin
    }
    availableLocales(includeDisabled: false) {
      code
      isDefault
      traductionKey
    }
    projectTypes {
      id
      title
    }
  }
`

const PROJECT_FRAGMENT = graphql`
  fragment ProjectConfigFormGeneral_project on Project {
    url
  }
`

const ProjectConfigFormGeneral: React.FC<ProjectConfigFormGeneralProps> = ({
  query: queryRef,
  project: projectRef,
}) => {
  const intl = useIntl()
  const query = useFragment(QUERY_FRAGMENT, queryRef)
  const project = useFragment(PROJECT_FRAGMENT, projectRef)
  const defaultLocale = query.availableLocales.find(locale => locale.isDefault)

  const isAdmin = query?.viewer?.isAdmin

  const methods = useFormContext()

  const { control } = methods
  const isNewProjectPage = useFeatureFlag('new_project_page')

  return (
    <Flex p={6} direction="column" spacing={6} backgroundColor="white" borderRadius="accordion">
      <Flex alignItems="center" justifyContent="space-between">
        <Heading as="h4" fontWeight="semibold" color="blue.800">
          {intl.formatMessage({ id: 'global.general' })}
        </Heading>
        {isNewProjectPage && project?.url ? (
          <Flex fontSize={CapUIFontSize.BodyRegular} color="blue.500">
            <Icon name={CapUIIcon.Eye} />
            <Link
              href={project.url}
              target="_blank"
              ml={1}
              fontWeight={600}
              sx={{
                textDecoration: 'none !important',
              }}
            >
              {intl.formatMessage({ id: 'global.preview' })}
            </Link>
          </Flex>
        ) : null}
      </Flex>

      <Flex direction="column" spacing={3}>
        <Flex spacing={6}>
          {isNewProjectPage ? (
            <FormControl
              name="cover"
              control={control}
              width="40%"
              mt={-1}
              spacing={0}
              sx={{
                '& *': { minWidth: 'unset !important', maxWidth: '100%' },
                '.cap-uploader > div': { height: '190px' },
              }}
            >
              <FormLabel label={intl.formatMessage({ id: 'cover-image' })}>
                <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
                  {intl.formatMessage({ id: 'global.optional' })}
                </Text>
              </FormLabel>
              <FieldInput
                type="uploader"
                name="cover"
                control={control}
                format=".jpg,.jpeg,.png"
                maxSize={8000000}
                minResolution={{
                  width: 800,
                  height: 500,
                }}
                size={UPLOADER_SIZE.LG}
                uploadURI={UPLOAD_PATH}
                showThumbnail
              />
            </FormControl>
          ) : null}
          <Flex direction="column" spacing={1} width="60%">
            <FormControl name="title" control={control} isRequired>
              <FormLabel htmlFor="title" label={intl.formatMessage({ id: 'global.title' })} />
              <FieldInput
                id="title"
                name="title"
                control={control}
                type="text"
                maxLength={140}
                placeholder={intl.formatMessage({
                  id: 'admiun.project.create.title.placeholder',
                })}
              />
            </FormControl>
            {isAdmin ? (
              <FormControl name="authors" control={control}>
                <FormLabel label={intl.formatMessage({ id: 'global.author' })} />
                {/** @ts-expect-error MAJ DS Props */}
                <UserListField name="authors" control={control} isMulti id="authors" menuPortalTarget={undefined} />
              </FormControl>
            ) : null}
            <FormControl name="projectType" control={control}>
              <FormLabel
                label={intl.formatMessage({
                  id: 'admin.fields.project.type.title',
                })}
              >
                <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
                  {intl.formatMessage({ id: 'global.optional' })}
                </Text>
              </FormLabel>
              <FieldInput
                name="projectType"
                id="projectType"
                control={control}
                options={
                  query?.projectTypes?.filter(Boolean).map(type => ({
                    value: type.id,
                    label: intl.formatMessage({ id: type.title }),
                  })) || []
                }
                type="select"
                placeholder={intl.formatMessage({
                  id: 'admin.fields.menu_item.parent_empty',
                })}
                clearable
                // @ts-expect-error : https://github.com/cap-collectif/form/issues/5
                menuPortalTarget={undefined}
              />
            </FormControl>
          </Flex>
          {!isNewProjectPage ? (
            <FormControl
              name="cover"
              control={control}
              width="40%"
              mt={-1}
              spacing={0}
              sx={{
                '& *': { minWidth: 'unset !important', maxWidth: '100%' },
                '.cap-uploader > div': { height: '190px' },
              }}
            >
              <FormLabel label={intl.formatMessage({ id: 'cover-image' })}>
                <Text fontSize={CapUIFontSize.BodySmall} color="gray.500">
                  {intl.formatMessage({ id: 'global.optional' })}
                </Text>
              </FormLabel>
              <FieldInput
                type="uploader"
                name="cover"
                control={control}
                format=".jpg,.jpeg,.png"
                maxSize={8000000}
                minResolution={{
                  width: 800,
                  height: 500,
                }}
                size={UPLOADER_SIZE.LG}
                uploadURI={UPLOAD_PATH}
                showThumbnail
              />
            </FormControl>
          ) : null}
        </Flex>
        <FormProvider {...methods}>
          <TextEditor
            mb={0}
            mt={6}
            name="description"
            label={intl.formatMessage({ id: 'admin.project.presentation' })}
            platformLanguage={defaultLocale?.code}
            selectedLanguage={defaultLocale?.code}
          />
        </FormProvider>
      </Flex>
    </Flex>
  )
}

export default ProjectConfigFormGeneral
