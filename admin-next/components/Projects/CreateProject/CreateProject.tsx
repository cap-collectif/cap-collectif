import React, { useState } from 'react'
import { Flex } from '@cap-collectif/ui'
import CreateProjectForm from '@components/Projects/CreateProject/CreateProjectForm'
import CreateProjectHelpMessage from '@components/Projects/CreateProject/CreateProjectHelpMessage'
import CreateProjectIllustration from '@components/Projects/CreateProject/CreateProjectIllustration'
import { graphql, useFragment } from 'react-relay'
import { CreateProject_viewer$key } from '@relay/CreateProject_viewer.graphql'

type Props = {
  viewer: CreateProject_viewer$key
}

export const VIEWER_FRAGMENT = graphql`
  fragment CreateProject_viewer on User {
    ...CreateProjectForm_viewer
  }
`

const CreateProject: React.FC<Props> = ({ viewer: viewerRef }) => {
  const viewer = useFragment(VIEWER_FRAGMENT, viewerRef)
  const [showHelpMessage, setShowHelpMessage] = useState(false)

  return (
    <>
      <Flex padding="32px">
        <CreateProjectForm viewer={viewer} setShowHelpMessage={setShowHelpMessage} />
        <Flex ml="128px" direction="column" alignItems="center">
          <CreateProjectHelpMessage showHelpMessage={showHelpMessage} />
          <CreateProjectIllustration />
        </Flex>
      </Flex>
    </>
  )
}

export default CreateProject
