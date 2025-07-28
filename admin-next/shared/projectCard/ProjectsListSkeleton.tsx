import * as React from 'react'
import { Box, Flex, Grid, AbstractCard, Skeleton } from '@cap-collectif/ui'
import { pxToRem } from '@shared/utils/pxToRem'

type Props = {
  count: number
  templateColumns?: string | Array<string>
}

const ProjectsListPlaceholder = ({ count, templateColumns }: Props) => (
  <Grid templateColumns={templateColumns || ['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']} gap="lg" mt={8} px={['md', 0]}>
    {[...Array(count)].map((_, index) => (
      <Flex key={index}>
        <AbstractCard width="100%" bg="white" p={4} flexDirection="column" display="flex" border="unset">
          <Box backgroundColor="gray.150" position="relative" width="100%" pt="66.66%" />
          <Flex direction="column" m={4} bg="white" flex={1}>
            <Box backgroundColor="gray.150" height={6} width="100%" borderRadius="normal" mb={2} />
            <Flex direction="row" spacing={8} mt={[3, 6]}>
              <Box backgroundColor="gray.100" height={4} width="20%" borderRadius="normal" />
              <Box backgroundColor="gray.100" height={4} width="20%" borderRadius="normal" />
              <Box backgroundColor="gray.100" height={4} width="20%" borderRadius="normal" />
            </Flex>
          </Flex>
        </AbstractCard>
      </Flex>
    ))}
  </Grid>
)

export const ProjectsListFiltersPlaceholder = () => (
  <Flex
    alignItems={['start', 'center']}
    justifyContent="space-between"
    flexDirection={['column', 'row']}
    px={['md', 0]}
  >
    <Flex gap={4} mb={['lg', 0]} flexWrap="wrap" alignItems="end">
      <Flex direction="column" gap="xxs">
        <Skeleton.Text width={pxToRem(40)} height={4} />
        <Skeleton.Text width={pxToRem(280)} height={pxToRem(40)} />
      </Flex>
      <Flex direction="column" gap="xxs">
        <Skeleton.Text width={pxToRem(40)} height={4} />
        <Skeleton.Text width={pxToRem(280)} height={pxToRem(40)} />
      </Flex>
      <Flex direction="column" gap="xxs">
        <Skeleton.Text width={pxToRem(40)} height={4} />
        <Skeleton.Text width={pxToRem(280)} height={pxToRem(40)} />
      </Flex>
    </Flex>
  </Flex>
)

export default ProjectsListPlaceholder
