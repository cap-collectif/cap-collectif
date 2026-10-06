<?php

namespace Capco\Tests\Mutation;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\Entity\Organization\PendingOrganizationInvitation;
use Capco\AppBundle\Security\RateLimiter;
use Capco\Tests\IdentityWebTestCase;
use Capco\UserBundle\Entity\User;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises HTTP outcomes and real domain data with transactional cleanup; replaces only external boundaries.
 */
final class RegisterMutationTest extends IdentityWebTestCase
{
    public function testOrganizationRegistrationPersistsMembershipAndConsumesInvitation(): void
    {
        $email = $this->uniqueEmail();
        $creator = $this->account();
        $organization = (new Organization())->setTitle('Registration organization')->setBody('Organization')->setEmail($this->uniqueEmail());
        $invitation = (new PendingOrganizationInvitation())->setEmail($email)->setOrganization($organization)->setCreator($creator)->setRole('user')->setToken(bin2hex(random_bytes(16)))->setExpiresAt(new \DateTime('2100-01-01'));
        $this->em->persist($organization);
        $this->em->persist($invitation);
        $this->em->flush();
        $invitationId = $invitation->getId();
        $organizationId = $organization->getId();
        $result = $this->register($email, $invitation->getToken());
        self::assertNull($result['errorsCode']);
        $this->em->clear();
        $user = $this->em->getRepository(User::class)->findOneBy(['email' => $email]);
        self::assertInstanceOf(User::class, $user);
        self::assertTrue(password_verify(self::PASSWORD, (string) $user->getPassword()));
        $member = $this->em->getRepository(OrganizationMember::class)->findOneBy(['user' => $user, 'organization' => $organizationId]);
        self::assertInstanceOf(OrganizationMember::class, $member);
        self::assertSame('user', $member->getRole());
        self::assertNull($this->em->find(PendingOrganizationInvitation::class, $invitationId));
    }

    public function testRegistrationRateLimitRefusesFourthRequestWithoutCreatingAccount(): void
    {
        $ip = '198.18.' . random_int(0, 255) . '.' . random_int(1, 254);
        $this->browser->setServerParameter('REMOTE_ADDR', $ip);
        $this->useProviderEnvironment(RateLimiter::class);
        $cache = self::getContainer()->get(RedisCache::class);
        $key = 'rateLimiterCacheKey-RegisterMutation-' . $ip;

        try {
            for ($attempt = 0; $attempt < 3; ++$attempt) {
                self::assertNull($this->register($this->uniqueEmail())['errorsCode']);
            }
            $email = $this->uniqueEmail();
            $refused = $this->register($email);
            self::assertSame(['RATE_LIMIT_REACHED'], $refused['errorsCode']);
            self::assertNull($refused['user']);
            $this->em->clear();
            self::assertNull($this->em->getRepository(User::class)->findOneBy(['email' => $email]));
        } finally {
            $cache->deleteItem($key);
        }
    }
}
