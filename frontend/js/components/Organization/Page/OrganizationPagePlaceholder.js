// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import Heading from '~/components/Ui/Primitives/Heading';
import Skeleton from '~/components/DesignSystem/Skeleton';
import Flex from '~/components/Ui/Primitives/Layout/Flex';
import AppBox from '~/components/Ui/Primitives/AppBox';
import ProjectsListPlaceholder from '~/components/Project/List/ProjectsListPlaceholder';

const OrganizationPagePlaceholder = (): React.Node => {
  const intl = useIntl();
  return (
    <>
      <Flex as="section" id="organizationHeaderLoading" bg="white">
        <Flex
          maxWidth="1200px"
          width="100%"
          margin="auto"
          justify="space-between"
          bg="white"
          p={[0, 8]}
          direction={['column-reverse', 'row']}>
          <Flex direction="column" maxWidth="550px" p={[4, 0]} width="100%">
            <Skeleton.Text height={8} width="90%" mb={8} />
            <div>
              <Skeleton.Text width="90%" height={4} mb={2} />
              <Skeleton.Text width="70%" height={4} mb={2} />
              <Skeleton.Text width="80%" height={4} mb={2} />
            </div>
          </Flex>
          <AppBox borderRadius="8px" position="relative">
            <Skeleton.Text
              width={['100%', '405px']}
              borderRadius={[0, 'accordion']}
              minHeight={['unset', '270px']}
              maxHeight="315px"
            />
          </AppBox>
        </Flex>
      </Flex>
      <Flex as="section" id="organizationContentLoading" bg="neutral-gray.50">
        <Flex
          maxWidth="1200px"
          width="100%"
          margin="auto"
          justify="space-between"
          p={8}
          direction={['column', 'row']}>
          <Flex direction="column" width={['100%', 'calc(70% - 16px)']}>
            <Heading as="h4" mb={4}>
              {intl.formatMessage({ id: 'project.title' })}
            </Heading>
            <ProjectsListPlaceholder count={4} templateColumns={['1fr', 'repeat(2, 1fr)']} />
          </Flex>
          <Flex direction="column" width={['100%', '30%']}>
            <Flex direction="column" maxWidth={['100%', '380px']} width="100%">
              <Heading as="h4" mb={4}>
                {intl.formatMessage({ id: 'homepage.section.events' })}
              </Heading>
              <Skeleton.Text width="100%" height="100px" mb={4} />
              <Skeleton.Text width="100%" height="100px" mb={4} />
            </Flex>
            <Flex direction="column" maxWidth={['100%', '380px']} width="100%">
              <Heading as="h4" mb={4}>
                {intl.formatMessage({ id: 'capco.module.blog' })}
              </Heading>
              <Skeleton.Text width="100%" height="100px" mb={4} />
              <Skeleton.Text width="100%" height="100px" mb={4} />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};

export default OrganizationPagePlaceholder;
