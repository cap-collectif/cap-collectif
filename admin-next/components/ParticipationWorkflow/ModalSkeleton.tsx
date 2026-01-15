import React from 'react'
import { Flex, Skeleton, Box } from '@cap-collectif/ui'
import useIsMobile from '@shared/hooks/useIsMobile'

const ModalSkeleton: React.FC = () => {
  const isMobile = useIsMobile()

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (isMobile) {
    return (
      <>
        <Flex
          direction="column"
          height="100%"
          width="100%"
          position="absolute"
          top={0}
          left={0}
          bg="white"
          zIndex={10000}
        >
          <Flex justifyContent="space-around" height="60px" mt={4} alignItems="center">
            <Skeleton.Text height="40px" width="80%" />
          </Flex>
          <Box>
            <Flex margin="auto" alignItems="center" direction="column" p={4}>
              <Skeleton.Text height="40px" width="60%" mb={4} />
              <Skeleton.Text height="25px" width="40%" />
              <Box mt={10} width="80%">
                <Flex direction="column" mb={6}>
                  <Skeleton.Text height="16px" width="10rem" mb={2} />
                  <Skeleton.Text height="40px" width="100%" />
                </Flex>
                <Flex direction="column" mb={6}>
                  <Skeleton.Text height="16px" width="10rem" mb={2} />
                  <Skeleton.Text height="40px" width="100%" />
                </Flex>
                <Flex direction="column">
                  <Skeleton.Text height="40px" width="100%" mb={4} />
                </Flex>
              </Box>
            </Flex>
          </Box>
        </Flex>
      </>
    )
  }

  return (
    <>
      <Flex
        direction="column"
        height="100%"
        width="100%"
        position="absolute"
        top={0}
        left={0}
        bg="white"
        zIndex={10000}
      >
        <Flex justifyContent="space-around" height="80px" mt={4} alignItems="center">
          <Skeleton.Text height="40px" width="15rem" />
          <Skeleton.Text height="40px" width="540px" />
          <Skeleton.Text height="40px" width="15rem" />
        </Flex>
        <Box>
          <Flex margin="auto" width="540px" alignItems="center" direction="column" pt="100px">
            <Skeleton.Text height="40px" width="35rem" mb={4} />
            <Skeleton.Text height="25px" width="15rem" />
            <Box mt={10}>
              <Flex direction="column" mb={6}>
                <Skeleton.Text height="16px" width="10rem" mb={2} />
                <Skeleton.Text height="40px" width="30rem" />
              </Flex>
              <Flex direction="column" mb={6}>
                <Skeleton.Text height="16px" width="10rem" mb={2} />
                <Skeleton.Text height="40px" width="30rem" />
              </Flex>
              <Flex direction="column">
                <Skeleton.Text height="40px" width="30rem" mb={4} />
              </Flex>
            </Box>
          </Flex>
        </Box>
      </Flex>
    </>
  )
}

export default ModalSkeleton
