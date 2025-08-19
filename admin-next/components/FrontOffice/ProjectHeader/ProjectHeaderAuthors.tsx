import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  CapUIFontSize,
  CapUIModalSize,
  Flex,
  Heading,
  Link,
  Modal,
} from '@cap-collectif/ui'
import { layoutProjectQuery$data } from '@relay/layoutProjectQuery.graphql'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import useIsMobile from '@shared/hooks/useIsMobile'
import { FC } from 'react'
import { useIntl } from 'react-intl'

type ProjectHeaderAuthorsProps = { authors: layoutProjectQuery$data['project']['authors']; defaultAvatarImage?: string }

const Author: FC<{ author: layoutProjectQuery$data['project']['authors'][0]; defaultAvatarImage?: string }> = ({
  author,
  defaultAvatarImage,
}) => {
  const intl = useIntl()
  const isMobile = useIsMobile()
  const profiles = useFeatureFlag('profiles')
  const { username, url, media } = author
  const showProfileLink = profiles || author.__typename === 'Organization'
  const title = intl.formatMessage({ id: 'usernames-profile' }, { userName: username })

  return (
    <Flex gap="sm" align="center" zIndex={1}>
      <Avatar size={isMobile ? 'xl' : 'lg'} name={username || ''} src={media?.url || defaultAvatarImage} />
      <Box fontSize={CapUIFontSize.BodyRegular}>
        {showProfileLink ? (
          <Link href={url} title={title} color="primary.darker">
            {username}
          </Link>
        ) : (
          username
        )}
      </Box>
    </Flex>
  )
}

export const ProjectHeaderAuthors: FC<ProjectHeaderAuthorsProps> = ({ authors, defaultAvatarImage }) => {
  const intl = useIntl()

  if (!authors.length) return null
  if (authors.length === 1) return <Author author={authors[0]} defaultAvatarImage={defaultAvatarImage} />

  return (
    <Flex gap="sm" align={['end', 'center']} zIndex={1}>
      <AvatarGroup size="lg">
        {authors.slice(0, 3).map(({ id, username, media }) => (
          <Avatar key={id} name={username || ''} src={media?.url || defaultAvatarImage} />
        ))}
      </AvatarGroup>
      <Modal
        id="show-authors-modal"
        ariaLabel={intl.formatMessage({
          id: 'project.authors',
        })}
        size={CapUIModalSize.Lg}
        disclosure={
          <Box _hover={{ textDecoration: 'underline' }}>
            {intl.formatMessage(
              {
                id: 'avatar-group-shownames',
              },
              {
                name: authors[0]?.username,
                length: authors.length - 1,
              },
            )}
          </Box>
        }
      >
        {({ hide }) => (
          <>
            <Modal.Header>
              <Heading>
                {intl.formatMessage(
                  {
                    id: 'number-of-authors',
                  },
                  {
                    num: authors.length,
                  },
                )}
              </Heading>
            </Modal.Header>
            <Modal.Body>
              <Flex as="ul" direction="column" gap="md">
                {authors.map(author => (
                  <Author key={author.id} author={author} defaultAvatarImage={defaultAvatarImage} />
                ))}
              </Flex>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" variantSize="medium" onClick={hide}>
                {intl.formatMessage({
                  id: 'global.close',
                })}
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </Flex>
  )
}

export default ProjectHeaderAuthors
