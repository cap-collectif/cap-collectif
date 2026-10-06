<?php

namespace Capco\Tests\GraphQL\Resolver\User;

use Capco\Tests\IdentityWebTestCase;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises HTTP outcomes and real domain data with transactional cleanup; replaces only external boundaries.
 */
final class UserShowUrlBySlugResolverTest extends IdentityWebTestCase
{
    public function testTheGeneratedProfileLinkAddressesTheRequestedAccount(): void
    {
        $user = $this->account();
        $this->setFeature('server_side_rendering', false);
        $url = self::getContainer()->get(\Capco\AppBundle\GraphQL\Resolver\User\UserShowUrlBySlugResolver::class)($user->getSlug());
        $this->browser->request('GET', $url);
        self::assertSame(200, $this->browser->getResponse()->getStatusCode());
        self::assertStringContainsString($user->getUsername(), (string) $this->browser->getResponse()->getContent());
    }
}
