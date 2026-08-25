import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { Box, Flex, Table, Text } from '@cap-collectif/ui'
import { ProjectTypesListQuery } from '@relay/ProjectTypesListQuery.graphql'
import ProjectTypeModal from './ProjectTypeModal'

export const QUERY = graphql`
  query ProjectTypesListQuery {
    projectTypes {
      id
      title
      color
    }
  }
`

const ProjectTypesList: React.FC = () => {
  const intl = useIntl()
  const { projectTypes } = useLazyLoadQuery<ProjectTypesListQuery>(QUERY, {})

  return (
    <Box bg="white" p={6} borderRadius="8px" mb={8}>
      <Table emptyMessage={<Box />} width="100%">
        <Table.Thead>
          <Table.Tr>
            <Table.Th noPlaceholder>{intl.formatMessage({ id: 'global.type' })}</Table.Th>
            <Table.Th noPlaceholder width="20%">
              {intl.formatMessage({ id: 'global.color' })}
            </Table.Th>
            <Table.Th noPlaceholder width="10%" />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {projectTypes.map(projectType => (
            <Table.Tr key={projectType.id} rowId={projectType.id}>
              <Table.Td>{intl.formatMessage({ id: projectType.title })}</Table.Td>
              <Table.Td>
                <Flex align="center" spacing={2}>
                  <Box
                    width="20px"
                    height="20px"
                    borderRadius="4px"
                    bg={projectType.color}
                    border="1px solid"
                    borderColor="gray.200"
                  />
                  <Text>{projectType.color}</Text>
                </Flex>
              </Table.Td>
              <Table.Td>
                <Flex justify="flex-end">
                  <ProjectTypeModal projectType={projectType} />
                </Flex>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  )
}

ProjectTypesList.displayName = 'ProjectTypesList'

export default ProjectTypesList
