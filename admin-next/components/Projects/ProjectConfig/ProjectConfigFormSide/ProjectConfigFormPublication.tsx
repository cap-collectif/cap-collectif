import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { Accordion, CapUIIcon, Flex, FormLabel, Icon, ButtonQuickAction, Text, Link } from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { ProjectConfigFormPublication_project$key } from '@relay/ProjectConfigFormPublication_project.graphql'
import { useDisclosure } from '@liinkiing/react-hooks'
import { useIntl } from 'react-intl'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { Option } from '../ProjectConfigForm.utils'
import { graphql, useFragment } from 'react-relay'
import UpdateSlugModal from './UpdateSlugModal'

export interface ProjectConfigFormPublicationProps {
  locales: Option[]
  project: ProjectConfigFormPublication_project$key
}

const PROJECT_FRAGMENT = graphql`
  fragment ProjectConfigFormPublication_project on Project {
    url
    ...UpdateSlugModal_project
  }
`

const ProjectConfigFormPublication: React.FC<ProjectConfigFormPublicationProps> = ({
  locales,
  project: projectRef,
}) => {
  const intl = useIntl()
  const { control } = useFormContext()
  const hasFeatureMultilangue = useFeatureFlag('multilangue')
  const project = useFragment(PROJECT_FRAGMENT, projectRef)
  const { isOpen, onOpen, onClose } = useDisclosure(false)

  const { url } = project

  return (
    <>
      <Flex color="blue.500" position="absolute" right={6} top={6}>
        <Icon name={CapUIIcon.Eye} />
        <Link
          href={url ?? ''}
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
      <Accordion.Button>{intl.formatMessage({ id: 'global.publication' })}</Accordion.Button>
      <Accordion.Panel>
        <FormControl name="publishedAt" control={control}>
          <FormLabel label={intl.formatMessage({ id: 'global.updated.date' })} />
          <FieldInput type="date" name="publishedAt" control={control} />
        </FormControl>
        {hasFeatureMultilangue ? (
          <FormControl name="locale" control={control} width="100%">
            <FormLabel label={intl.formatMessage({ id: 'form.label_locale' })} />
            <FieldInput
              type="select"
              name="locale"
              placeholder={intl.formatMessage({ id: 'locale.all-locales' })}
              control={control}
              options={locales}
              // @ts-ignore cap-collectif/form/issues/53
              id="locale"
            />
          </FormControl>
        ) : null}
        {isOpen ? <UpdateSlugModal project={project} onClose={onClose} /> : null}
        <FormLabel label={intl.formatMessage({ id: 'permalink' })} mb={1} />
        <Flex
          border="normal"
          borderRadius="normal"
          borderColor="gray.300"
          justify="space-between"
          alignItems="center"
          pl={2}
        >
          <Text truncate={30}>{url}</Text>
          <ButtonQuickAction
            id="edit-slug"
            variantColor="blue"
            icon={CapUIIcon.Pencil}
            label={intl.formatMessage({
              id: 'global.edit',
            })}
            onClick={onOpen}
            type="button"
          />
        </Flex>
      </Accordion.Panel>
    </>
  )
}

export default ProjectConfigFormPublication
