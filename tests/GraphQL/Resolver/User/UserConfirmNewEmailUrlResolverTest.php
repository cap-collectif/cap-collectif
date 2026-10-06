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
final class UserConfirmNewEmailUrlResolverTest extends IdentityWebTestCase
{
    public function testTheGeneratedEmailLinkConfirmsOnlyItsPendingAddress(): void
    {
        $user = $this->account();
        $id = $user->getId();
        $newEmail = $this->uniqueEmail();
        $user->setNewEmailToConfirm($newEmail)->setNewEmailConfirmationToken('new-email-token');
        $this->em->flush();
        $url = self::getContainer()->get(\Capco\AppBundle\GraphQL\Resolver\User\UserConfirmNewEmailUrlResolver::class)($user);
        self::assertNotNull($url);
        $this->browser->request('GET', $url);
        self::assertTrue($this->browser->getResponse()->isRedirection());
        $persisted = $this->reload($id);
        self::assertSame($newEmail, $persisted->getEmail());
        self::assertNull($persisted->getNewEmailConfirmationToken());
        self::assertNull(self::getContainer()->get(\Capco\AppBundle\GraphQL\Resolver\User\UserConfirmNewEmailUrlResolver::class)($persisted));
    }
}
