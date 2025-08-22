import { Box, CapUIIcon, CapUIModalSize, EntityPlaceholder, Heading, Modal, SROnly, Tag } from '@cap-collectif/ui'
import { layoutProjectQuery$data } from '@relay/layoutProjectQuery.graphql'
import Image, { getSrcSet } from '@shared/ui/Image'
import { pxToRem } from '@shared/utils/pxToRem'
import { FC } from 'react'
import { useIntl } from 'react-intl'
import useIsMobile from '@shared/hooks/useIsMobile'
import Play from './Play'

export const ProjectHeaderCover: FC<{
  project: layoutProjectQuery$data['project']
}> = ({ project }) => {
  const isMobile = useIsMobile()
  const intl = useIntl()
  const { cover, archived, visibility, video } = project
  const projectCover = cover?.url

  return (
    <Box
      className="projectHeader__coverImage"
      width={['100%', pxToRem(405)]}
      borderRadius={[0, 'accordion']}
      overflow="hidden"
      minHeight={pxToRem(270)}
      maxHeight={pxToRem(315)}
      position="relative"
    >
      {video ? (
        <Modal
          size={CapUIModalSize.Md}
          ariaLabel={intl.formatMessage({
            id: 'project-header-video-modal',
          })}
          fullSizeOnMobile
          height={isMobile ? '64%' : '60%'}
          width={isMobile ? '90%' : '60%'}
          disclosure={
            <Box
              zIndex={1}
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bg="#00000040"
              sx={{
                '&:focus-visible': {
                  border: '4px solid',
                  background: '#00000080',
                },
              }}
            >
              <Play />
              <SROnly>{intl.formatMessage({ id: 'project-header.watch_video' })}</SROnly>
            </Box>
          }
        >
          <Modal.Header>
            <Heading>
              {intl.formatMessage({
                id: 'project-header-video-modal',
              })}
            </Heading>
          </Modal.Header>
          <iframe
            title="Video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            src={video}
            width="100%"
            height="100%"
          />
        </Modal>
      ) : null}
      {projectCover ? (
        <Image
          {...getSrcSet(projectCover)}
          alt=""
          width={['100%', pxToRem(405)]}
          height="100%"
          minHeight={pxToRem(270)}
          maxHeight={pxToRem(315)}
          loading="eager"
          style={{
            objectFit: 'cover',
          }}
          sizes="(max-width: 320px) 320px,
        (max-width: 640px) 640px,
        (max-width: 2560px) 960px,"
        />
      ) : (
        <EntityPlaceholder icon={CapUIIcon.FolderO} scale="3" color="primary.base" />
      )}
      {archived && visibility === 'PUBLIC' ? (
        <Tag id="cap-project-archived" variantColor="infoGray" position="absolute" top="xs" right="xs">
          <Tag.LeftIcon name={CapUIIcon.FolderO} />
          <Tag.Label>
            {intl.formatMessage({
              id: 'global-archived',
            })}
          </Tag.Label>
        </Tag>
      ) : null}
    </Box>
  )
}

export default ProjectHeaderCover
