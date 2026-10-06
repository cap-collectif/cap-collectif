<?php

declare(strict_types=1);

namespace Capco\Tests\UserBundle\Functional;

use Capco\UserBundle\Entity\User;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Exercises account contracts through HTTP with fresh database reads, transactional cleanup and external boundary doubles.
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 */
final class RegistrationTest extends AccountWebTestCase
{
    private const REGISTER = 'mutation($input: RegisterInput!) { register(input: $input) { user { id } errorsCode } }';

    protected function setUp(): void
    {
        parent::setUp();
        $this->allowRegistrationWithoutCustomResponses();
    }

    public function testRegistrationConfirmationLoginAndConsentPersistence(): void
    {
        $email = $this->uniqueEmail();
        $result = $this->graphql(self::REGISTER, ['input' => $this->input($email)])['register'];
        self::assertNull($result['errorsCode']);
        self::assertNotNull($result['user']);
        $this->em->clear();
        $user = $this->em->getRepository(User::class)->findOneBy(['email' => $email]);
        self::assertInstanceOf(User::class, $user);
        $id = $user->getId();
        $token = $user->getConfirmationToken();
        self::assertNotNull($token);
        self::assertTrue($user->isEnabled());
        self::assertFalse($user->isEmailConfirmed());
        self::assertTrue($user->isConsentInternalCommunication());
        self::assertTrue($user->isConsentExternalCommunication());
        self::assertNotSame(self::PASSWORD, $user->getPassword());
        self::assertTrue(password_verify(self::PASSWORD, (string) $user->getPassword()));
        $this->request('GET', '/account/email_confirmation/' . $token);
        self::assertTrue($this->browser->getResponse()->isRedirection());
        $user = $this->reload($id);
        self::assertNull($user->getConfirmationToken());
        self::assertNotNull($user->getConfirmedAccountAt());
        self::assertTrue($user->isEmailConfirmed());
        $confirmedAt = $user->getConfirmedAccountAt();
        $this->request('GET', '/account/email_confirmation/' . $token);
        self::assertTrue($this->browser->getResponse()->isRedirection());
        self::assertEquals($confirmedAt, $this->reload($id)->getConfirmedAccountAt());
        $this->logout();
        $this->login($email);
        $this->logout();
    }

    /**
     * @dataProvider invalidRegistrationInputs
     *
     * @param list<string> $errors
     */
    public function testRejectsInvalidRegistrationWithoutPersistingAccount(string $field, string $value, array $errors): void
    {
        $email = $this->uniqueEmail();
        $input = $this->input($email);
        $input[$field] = $value;
        $this->mailer->expects(self::never())->method('createAndSendMessage');
        $response = $this->graphql(self::REGISTER, ['input' => $input]);
        self::assertNull($response['register']['user']);
        self::assertSame($errors, $response['register']['errorsCode']);
        $this->em->clear();
        self::assertNull($this->em->getRepository(User::class)->findOneBy(['email' => $input['email']]));
        self::assertSame([], $this->messages);
    }

    /** @return iterable<string, array{string, string, list<string>}> */
    public static function invalidRegistrationInputs(): iterable
    {
        yield 'empty username' => ['username', '', ['USERNAME_BLANK']];
        yield 'invalid email' => ['email', 'invalid-address', ['EMAIL_THROWABLE']];
        yield 'empty password' => ['plainPassword', '', ['PASSWORD_BLANK']];
        yield 'short password' => ['plainPassword', 'Aa1', []];
    }

    /** @dataProvider incompletePasswords */
    public function testCharacterizationGapRegistrationAcceptsIncompletePasswordComplexity(string $password): void
    {
        $email = $this->uniqueEmail();
        $input = $this->input($email);
        $input['plainPassword'] = $password;
        $payload = $this->graphql(self::REGISTER, ['input' => $input])['register'];
        self::assertNull($payload['errorsCode']);
        self::assertNotNull($payload['user']);
        $this->em->clear();
        $user = $this->em->getRepository(User::class)->findOneBy(['email' => $email]);
        self::assertInstanceOf(User::class, $user);
        self::assertTrue(password_verify($password, (string) $user->getPassword()));
    }

    /** @return iterable<string, array{string}> */
    public static function incompletePasswords(): iterable
    {
        yield 'missing digit' => ['PasswordOnly'];
        yield 'missing uppercase' => ['password123'];
        yield 'missing lowercase' => ['PASSWORD123'];
    }

    public function testRegistrationDisabledDoesNotCreateAnAccount(): void
    {
        $this->setFeature('registration', false);
        $email = $this->uniqueEmail();
        $response = $this->graphResponse(self::REGISTER, ['input' => $this->input($email)]);
        self::assertSame(['REGISTER_FEATURE_NOT_ENABLED'], $response['data']['register']['errorsCode']);
        self::assertNull($response['data']['register']['user']);
        $this->em->clear();
        self::assertNull($this->em->getRepository(User::class)->findOneBy(['email' => $email]));
    }

    public function testCanonicalEmailCollisionDoesNotCreateASecondAccount(): void
    {
        $user = $this->account();
        $id = $user->getId();
        $email = $user->getEmail();
        $this->mailer->expects(self::never())->method('createAndSendMessage');
        $payload = $this->graphql(self::REGISTER, ['input' => $this->input(strtoupper($user->getEmail()))])['register'];
        self::assertNull($payload['user']);
        self::assertContains('EMAIL_ALREADY_USED', $payload['errorsCode']);
        self::assertSame($email, $this->reload($id)->getEmail());
        $accounts = $this->em->getRepository(User::class)->findBy(['emailCanonical' => $email]);
        self::assertSame([$id], array_map(static fn (User $account): string => $account->getId(), $accounts));
        self::assertSame([], $this->messages);
    }

    public function testInvalidConfirmationDoesNotChangeUnconfirmedAccount(): void
    {
        $user = $this->account();
        $user->setConfirmationToken(str_repeat('a', 43));
        $this->em->flush();
        $id = $user->getId();
        $token = $user->getConfirmationToken();
        $this->request('GET', '/account/email_confirmation/' . str_repeat('b', 43));
        self::assertTrue($this->browser->getResponse()->isRedirection());
        $user = $this->reload($id);
        self::assertFalse($user->isEmailConfirmed());
        self::assertSame($token, $user->getConfirmationToken());
        self::assertNull($user->getConfirmedAccountAt());
        $this->assertViewer(false);
    }

    public function testCharacterizationGapOldConfirmationTokenRemainsValid(): void
    {
        $user = $this->account();
        $id = $user->getId();
        $user->setConfirmationToken(str_repeat('a', 43));
        $user->setEmailConfirmationSentAt(new \DateTime('2000-01-01 00:00:00 UTC'));
        $this->em->flush();
        $this->request('GET', '/account/email_confirmation/' . $user->getConfirmationToken());
        self::assertTrue($this->browser->getResponse()->isRedirection());
        $user = $this->reload($id);
        self::assertTrue($user->isEmailConfirmed());
        self::assertNull($user->getConfirmationToken());
    }

    /** @return array<string, mixed> */
    private function input(string $email): array
    {
        return [
            'email' => $email, 'username' => 'New account', 'plainPassword' => self::PASSWORD,
            'responses' => [], 'captcha' => 'test', 'consentInternalCommunication' => true,
            'consentExternalCommunication' => true,
        ];
    }
}
