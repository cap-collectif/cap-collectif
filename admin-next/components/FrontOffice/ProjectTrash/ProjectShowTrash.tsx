'use client'

import { Box, CapUIFontSize, Link, Text } from '@cap-collectif/ui'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { pxToRem } from '@shared/utils/pxToRem'
import { FC } from 'react'
import { useIntl } from 'react-intl'

type ProjectShowTrashProps = { projectSlug: string }

export const ProjectShowTrash: FC<ProjectShowTrashProps> = ({ projectSlug }) => {
  const intl = useIntl()

  const project_trash = useFeatureFlag('project_trash')

  if (!project_trash) return null

  return (
    <Box id="trash-section" as="section" backgroundColor="white" textAlign="center" fontSize={CapUIFontSize.BodyLarge}>
      <Box maxWidth={pxToRem(1280)} width="100%" margin="auto" py={8} pt={[0, 8]} px={[0, 4, 6]}>
        <Box fontSize={CapUIFontSize.DisplaySmall}>{intl.formatMessage({ id: 'project.show.trashed.short_name' })}</Box>
        <Text color="neutral-gray.darker" my="xs">
          {intl.formatMessage({ id: 'project.show.trashed.text' })}
        </Text>
        {/* TODO : LoginOverlay fuckss */}
        <Link id="trash-link" href={`/projects/${projectSlug}/trashed`}>
          <p>{intl.formatMessage({ id: 'project.show.trashed.display' })}</p>
        </Link>
      </Box>
    </Box>
  )
}

export default ProjectShowTrash
