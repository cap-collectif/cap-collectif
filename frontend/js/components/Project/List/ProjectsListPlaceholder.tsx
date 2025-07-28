import * as React from 'react'
import { Box, Flex, Grid, AbstractCard } from '@cap-collectif/ui'

type Props = {
  readonly count: number
  readonly templateColumns?: string | Array<string>
}

const ProjectsListPlaceholder = ({ count, templateColumns }: Props) => {
  return (
    <Grid templateColumns={templateColumns || ['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}>
      {[...Array(count)].map((_, index) => (
        <Flex mt={7} mb={7} mr={5} ml={5} key={index}>
          <AbstractCard
            width="100%"
            bg="white"
            p={0}
            flexDirection="column"
            display="flex"
            border="unset"
            boxShadow="small"
          >
            <Box backgroundColor="gray.150" position="relative" width="100%" pt="66.66%" />
            <Flex direction="column" m={4} bg="white" flex={1}>
              <Box backgroundColor="gray.150" height={6} width="100%" borderRadius="4px" mb={2} />
              <Box backgroundColor="gray.150" height={6} width="66%" borderRadius="4px" mb={[3, 6]} />
              <Flex direction="row" spacing={8} mt={[3, 6]}>
                <Box backgroundColor="gray.100" height={4} width="20%" borderRadius="4px" />
                <Box backgroundColor="gray.100" height={4} width="20%" borderRadius="4px" />
                <Box backgroundColor="gray.100" height={4} width="20%" borderRadius="4px" />
              </Flex>
            </Flex>
          </AbstractCard>
        </Flex>
      ))}
    </Grid>
  )
}

export default ProjectsListPlaceholder
