<?php

namespace Capco\Tests\Mutation;

use Capco\Tests\IdentityWebTestCase;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises HTTP outcomes and real domain data with transactional cleanup; replaces only external boundaries.
 */
final class UpdateProfilePasswordMutationTest extends IdentityWebTestCase
{
    /** @dataProvider passwords */
    public function testPasswordChangePersistsOnlyValidChanges(string $current, string $new, bool $valid): void
    {
        $user = $this->account();
        $id = $user->getId();
        $hash = $user->getPassword();
        $this->login($user->getEmail());
        $result = $this->graphql('mutation($input: UpdateProfilePasswordInput!) { updateProfilePassword(input: $input) { user { id } error } }', ['input' => ['current_password' => $current, 'new_password' => $new]])['updateProfilePassword'];
        $persisted = $this->reload($id);
        if ($valid) {
            self::assertNull($result['error']);
            self::assertTrue(password_verify($new, (string) $persisted->getPassword()));
            self::assertContains(['type' => 'user.password', 'body' => ['userId' => $id]], $this->messages);
        } else {
            self::assertSame('fos_user.password.not_current', $result['error']);
            self::assertSame($hash, $persisted->getPassword());
            self::assertSame([], $this->messages);
        }
    }

    /** @return iterable<string, array{string, string, bool}> */
    public static function passwords(): iterable
    {
        yield 'valid change' => [self::PASSWORD, 'Changed456!', true];
        yield 'wrong current password' => ['wrong', 'Changed456!', false];
        yield 'weak new password' => [self::PASSWORD, 'weak', false];
    }
}
