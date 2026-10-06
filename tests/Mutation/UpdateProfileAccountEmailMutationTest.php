<?php

namespace Capco\Tests\Mutation;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Security\RateLimiter;
use Capco\Tests\IdentityWebTestCase;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises HTTP outcomes and real domain data with transactional cleanup; replaces only external boundaries.
 */
final class UpdateProfileAccountEmailMutationTest extends IdentityWebTestCase
{
    /** @dataProvider emailChanges */
    public function testEmailChangePersistsOnlyAcceptedPendingAddress(string $case, ?string $expected): void
    {
        $user = $this->account();
        $id = $user->getId();
        $email = $user->getEmail();
        $newEmail = 'used' === $case ? $this->account()->getEmail() : $this->uniqueEmail();
        if ('domain' === $case) {
            $this->setFeature('restrict_registration_via_email_domain', true);
            $newEmail = 'new@unlisted-contract-domain.example';
        }
        $this->login($email);
        $payload = $this->graphql('mutation($input: UpdateProfileAccountEmailInput!) { updateProfileAccountEmail(input: $input) { error viewer { id } } }', ['input' => ['email' => $newEmail, 'passwordConfirm' => 'password' === $case ? 'wrong' : self::PASSWORD]])['updateProfileAccountEmail'];
        self::assertSame($expected, $payload['error']);
        $persisted = $this->reload($id);
        self::assertSame($email, $persisted->getEmail());
        if (null === $expected) {
            self::assertSame($newEmail, $persisted->getNewEmailToConfirm());
            self::assertNotNull($persisted->getNewEmailConfirmationToken());
            self::assertContains(['type' => 'user.email', 'body' => ['userId' => $id]], $this->messages);
        } else {
            self::assertNull($persisted->getNewEmailToConfirm());
            self::assertNull($persisted->getNewEmailConfirmationToken());
            self::assertSame([], $this->messages);
        }
    }

    /** @return iterable<string, array{string, ?string}> */
    public static function emailChanges(): iterable
    {
        yield 'accepted' => ['valid', null];
        yield 'wrong password' => ['password', 'SPECIFY_PASSWORD'];
        yield 'used email' => ['used', 'ALREADY_USED_EMAIL'];
        yield 'unlisted domain' => ['domain', 'UNAUTHORIZED_EMAIL_DOMAIN'];
    }

    public function testUsedEmailDoesNotCreateAPasswordForAFranceConnectAccount(): void
    {
        $viewer = $this->account()->setPassword(null)->setFranceConnectAccessToken('provider-access-token');
        $id = $viewer->getId();
        $email = $viewer->getEmail();
        $existing = $this->account();
        $existingId = $existing->getId();
        $existingEmail = $existing->getEmail();
        $existingPassword = $existing->getPassword();
        $this->em->flush();
        $this->browser->loginUser($viewer);

        $result = $this->graphql('mutation($input: UpdateProfileAccountEmailInput!) { updateProfileAccountEmail(input: $input) { error } }', ['input' => ['email' => $existingEmail, 'passwordConfirm' => self::PASSWORD]])['updateProfileAccountEmail'];

        self::assertSame('ALREADY_USED_EMAIL', $result['error']);
        $persisted = $this->reload($id);
        self::assertSame($email, $persisted->getEmail());
        self::assertNull($persisted->getPassword());
        self::assertNull($persisted->getNewEmailToConfirm());
        self::assertNull($persisted->getNewEmailConfirmationToken());
        self::assertSame([], $this->messages);
        $existing = $this->reload($existingId);
        self::assertSame($existingEmail, $existing->getEmail());
        self::assertSame($existingPassword, $existing->getPassword());
    }

    public function testEmailChangeRateLimitKeepsPreviousPendingAddress(): void
    {
        $user = $this->account();
        $id = $user->getId();
        $this->useProviderEnvironment(RateLimiter::class);
        $this->login($user->getEmail());
        $cache = self::getContainer()->get(RedisCache::class);
        $key = 'rateLimiterCacheKey-UpdateProfileAccountEmail-' . $id;

        try {
            $query = 'mutation($input: UpdateProfileAccountEmailInput!) { updateProfileAccountEmail(input: $input) { error } }';
            for ($attempt = 0; $attempt < 3; ++$attempt) {
                $accepted = $this->uniqueEmail();
                self::assertNull($this->graphql($query, ['input' => ['email' => $accepted, 'passwordConfirm' => self::PASSWORD]])['updateProfileAccountEmail']['error']);
            }
            self::assertSame('RATE_LIMIT_REACHED', $this->graphql($query, ['input' => ['email' => $this->uniqueEmail(), 'passwordConfirm' => self::PASSWORD]])['updateProfileAccountEmail']['error']);
            self::assertSame($accepted, $this->reload($id)->getNewEmailToConfirm());
        } finally {
            $cache->deleteItem($key);
        }
    }
}
