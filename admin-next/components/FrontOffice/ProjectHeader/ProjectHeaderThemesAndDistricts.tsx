'use client'

import { CapUIIcon, Flex, Tag } from '@cap-collectif/ui'
import { layoutProjectQuery$data } from '@relay/layoutProjectQuery.graphql'

import { FC } from 'react'

type ProjectHeaderThemesAndDistrictsProps = {
  project: layoutProjectQuery$data['project']
}

export const ProjectHeaderThemesAndDistricts: FC<ProjectHeaderThemesAndDistrictsProps> = ({ project }) => {
  const { themes, districts } = project

  if (!themes?.length && !districts?.totalCount) return null

  return (
    <Flex wrap="wrap" gap="xs">
      <Flex wrap="wrap" gap="xs">
        {themes.map(theme => (
          <Tag key={theme.id} transparent variantColor="infoGray" px={0}>
            <Tag.LeftIcon name={CapUIIcon.FolderO} />
            <Tag.Label>{theme.title}</Tag.Label>
          </Tag>
        ))}
      </Flex>
      <Flex wrap="wrap" gap="xs">
        {districts.edges.map(({ node: district }) => (
          <Tag key={district.id} transparent variantColor="infoGray" px={0}>
            <Tag.LeftIcon name={CapUIIcon.PinO} />
            <Tag.Label>{district.name}</Tag.Label>
          </Tag>
        ))}
      </Flex>
    </Flex>
  )
}

export default ProjectHeaderThemesAndDistricts
