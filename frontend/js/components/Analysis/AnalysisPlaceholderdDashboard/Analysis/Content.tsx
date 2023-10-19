import * as React from 'react'
import Flex from '~ui/Primitives/Layout/Flex'
import AppBox from '~ui/Primitives/AppBox'
import Skeleton from '~ds/Skeleton'

type Props = {
  isAdmin?: boolean
}

const Avatar = () => (
  <AppBox position="relative" p={1}>
    <Skeleton.Circle size={6} />
    <Skeleton.Circle position="absolute" right={0} bottom={1} size={2} bg="gray.500" />
  </AppBox>
)

const Content = ({ isAdmin }: Props) => (
  <Flex direction="row" align="center" justify="flex-end">
    {isAdmin && <Skeleton.Text size="lg" width="60px" borderRadius="20px" mr={7} />}

    <Flex direction="row" spacing={8}>
      <Avatar />
      <Avatar />
      <Avatar />
    </Flex>
  </Flex>
)

export default Content
