import { Skeleton, Flex, ListCard } from '@cap-collectif/ui'

const AuthenticationMethodsPlaceholder = () => (
  <Flex direction="column" p={6} bg="white" borderRadius="8px" width="70%">
    <Flex direction="column" spacing={2} mb={4}>
      <Skeleton.Text width="25%" size="lg" />
      <Skeleton.Text width="90%" size="sm" />
    </Flex>

    <Flex direction="row" spacing={4} height="172px" mb={9} justify="space-between">
      <Skeleton.Text width="32%" height="100%" />
      <Skeleton.Text width="32%" height="100%" />
      <Skeleton.Text width="32%" height="100%" />
    </Flex>

    <Flex direction="column" spacing={2}>
      <Skeleton.Text width="25%" size="lg" />
      <Skeleton.Text width="90%" size="sm" />

      <ListCard>
        <ListCard.Item justify="space-between">
          <Skeleton.Text width="30%" size="lg" />
          <Skeleton.Text width="32px" height="16px" borderRadius="10px" />
        </ListCard.Item>
        <ListCard.Item>
          <Skeleton.Text width="30%" size="lg" />
          <Skeleton.Text width="32px" height="16px" borderRadius="10px" />
        </ListCard.Item>
        <ListCard.Item>
          <Skeleton.Text width="30%" size="lg" />
          <Skeleton.Text width="32px" height="16px" borderRadius="10px" />
        </ListCard.Item>
        <ListCard.Item>
          <Skeleton.Text width="30%" size="lg" />
          <Skeleton.Text width="32px" height="16px" borderRadius="10px" />
        </ListCard.Item>
      </ListCard>
    </Flex>
  </Flex>
)

export default AuthenticationMethodsPlaceholder
