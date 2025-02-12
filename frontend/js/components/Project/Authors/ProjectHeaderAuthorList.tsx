import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { useDisclosure } from '@liinkiing/react-hooks'
import type { ProjectHeaderAuthorList_project$key } from '~relay/ProjectHeaderAuthorList_project.graphql'
import ProjectHeaderLayout from '~ui/Project/ProjectHeader'
import ProjectHeaderAuthorsModal from '~/components/Project/Authors/ProjectHeaderAuthorsModal'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import UserAvatar from '~/components/User/UserAvatar'

const FRAGMENT = graphql`
  fragment ProjectHeaderAuthorList_project on Project {
    ...ProjectHeaderAuthorsModal_project
    authors {
      __typename
      id
      username
      url
      avatarUrl
      ...UserAvatar_user
    }
  }
`
export type Props = {
  readonly project: ProjectHeaderAuthorList_project$key
}

const ProjectHeaderAuthorList = ({ project }: Props): JSX.Element => {
  const profilesToggle = useFeatureFlag('profiles')
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const data = useFragment(FRAGMENT, project)

  if (data.authors && data.authors.length > 0) {
    const firstAuthor = data.authors[0]

    if (data.authors.length === 1) {
      const showProfileLink = profilesToggle || firstAuthor.__typename === 'Organization'
      return (
        <ProjectHeaderLayout.Authors
          active={showProfileLink}
          style={{
            cursor: showProfileLink ? 'pointer' : 'default',
          }}
          onClick={() => (showProfileLink ? window.open(firstAuthor.url, '_self') : null)}
          authors={data.authors}
        >
          <UserAvatar key={firstAuthor.id} user={firstAuthor} />
        </ProjectHeaderLayout.Authors>
      )
    }

    return (
      <>
        <ProjectHeaderAuthorsModal project={data} onClose={onClose} show={isOpen} />
        <ProjectHeaderLayout.Authors
          active={profilesToggle}
          style={{
            cursor: profilesToggle ? 'pointer' : 'default',
          }}
          onClick={onOpen}
          authors={data.authors}
        >
          {data.authors.map(author => (
            <UserAvatar key={author.id} user={author} />
          ))}
        </ProjectHeaderLayout.Authors>
      </>
    )
  }

  return null
}

export default ProjectHeaderAuthorList
