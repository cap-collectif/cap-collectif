<?php

namespace Capco\Tests\Mutation;

use Capco\Tests\IdentityWebTestCase;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises HTTP outcomes and real domain data with transactional cleanup; replaces only external boundaries.
 */
final class UpdateProfilePersonalDataMutationTest extends IdentityWebTestCase
{
    /** @dataProvider identities */
    public function testPersonalDataAuthorizationProtectsOtherAccounts(string $role, bool $self, bool $allowed): void
    {
        $viewer = $this->account();
        $viewer->addRole($role);
        $viewerId = $viewer->getId();
        $viewerName = $viewer->getUsername();
        $target = $self ? $viewer : $this->account();
        $targetId = $target->getId();
        $original = $target->getUsername();
        $this->em->flush();
        $this->login($viewer->getEmail());
        $result = $this->graphResponse('mutation($input: UpdateProfilePersonalDataInput!) { updateProfilePersonalData(input: $input) { user { id } errorCode } }', ['input' => ['userId' => GlobalId::toGlobalId('User', $targetId), 'username' => 'Updated name']]);
        if ($allowed) {
            self::assertArrayNotHasKey('errors', $result);
            self::assertNull($result['data']['updateProfilePersonalData']['errorCode']);
            self::assertSame(GlobalId::toGlobalId('User', $targetId), $result['data']['updateProfilePersonalData']['user']['id']);
            self::assertSame('Updated name', $this->reload($targetId)->getUsername());
        } else {
            self::assertSame('Only a SUPER_ADMIN can edit data from another user. Or the account owner', $result['errors'][0]['message']);
            self::assertSame($original, $this->reload($targetId)->getUsername());
        }
        if (!$self) {
            self::assertSame($viewerName, $this->reload($viewerId)->getUsername());
        }
    }

    /** @return iterable<string, array{string, bool, bool}> */
    public static function identities(): iterable
    {
        yield 'admin self' => ['ROLE_ADMIN', true, true];
        yield 'super admin self' => ['ROLE_SUPER_ADMIN', true, true];
        yield 'super admin other' => ['ROLE_SUPER_ADMIN', false, true];
        yield 'admin other refused' => ['ROLE_ADMIN', false, false];
        yield 'user self' => ['ROLE_USER', true, true];
        yield 'user other refused' => ['ROLE_USER', false, false];
    }

    public function testOmittingTheUserIdUpdatesOnlyTheViewersPersonalData(): void
    {
        $viewer = $this->account()->setPhone('+33612345678')->setPhoneConfirmed(true);
        $viewerId = $viewer->getId();
        $neighbor = $this->account();
        $neighborId = $neighbor->getId();
        $neighborName = $neighbor->getUsername();
        $neighborEmail = $neighbor->getEmail();
        $newEmail = $this->uniqueEmail();
        $this->em->flush();
        $this->login($viewer->getEmail());

        $result = $this->graphql('mutation($input: UpdateProfilePersonalDataInput!) { updateProfilePersonalData(input: $input) { user { id } errorCode } }', ['input' => ['username' => 'Updated personal data', 'email' => $newEmail]])['updateProfilePersonalData'];

        self::assertNull($result['errorCode']);
        self::assertSame(GlobalId::toGlobalId('User', $viewerId), $result['user']['id']);
        $viewer = $this->reload($viewerId);
        self::assertSame('Updated personal data', $viewer->getUsername());
        self::assertSame($newEmail, $viewer->getEmail());
        self::assertSame('+33612345678', $viewer->getPhone());
        self::assertTrue($viewer->isPhoneConfirmed());
        $neighbor = $this->reload($neighborId);
        self::assertSame($neighborName, $neighbor->getUsername());
        self::assertSame($neighborEmail, $neighbor->getEmail());
    }
}
