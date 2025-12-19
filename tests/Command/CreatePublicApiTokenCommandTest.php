<?php

namespace Capco\Tests\Command;

use Capco\AppBundle\Repository\PublicApiTokenRepository;
use Capco\UserBundle\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Console\Tester\CommandTester;

/**
 * @internal
 * @coversNothing
 */
class CreatePublicApiTokenCommandTest extends KernelTestCase
{
    private const COMMAND = 'capco:api:create-token';
    private const EXISTING_USER_EMAIL = 'lbrunet@cap-collectif.com';
    private const NON_EXISTING_USER_EMAIL = 'nonexistent@example.com';

    private CommandTester $commandTester;
    private PublicApiTokenRepository $tokenRepository;
    private UserRepository $userRepository;

    protected function setUp(): void
    {
        self::bootKernel();

        $application = new Application(self::$kernel);
        $command = $application->find(self::COMMAND);
        $this->commandTester = new CommandTester($command);

        $container = self::getContainer();

        $tokenRepository = $container->get(PublicApiTokenRepository::class);
        \assert($tokenRepository instanceof PublicApiTokenRepository);
        $this->tokenRepository = $tokenRepository;

        $userRepository = $container->get(UserRepository::class);
        \assert($userRepository instanceof UserRepository);
        $this->userRepository = $userRepository;
    }

    public function testCreateTokenForExistingUser(): void
    {
        $user = $this->userRepository->findOneByEmail(self::EXISTING_USER_EMAIL);
        $this->assertNotNull($user, 'Test user should exist in fixtures');

        $tokensBefore = [...$this->tokenRepository->findPublicApiTokensByUser($user)];
        $countBefore = \count($tokensBefore);

        $this->commandTester->execute([
            'userEmail' => self::EXISTING_USER_EMAIL,
        ]);

        $this->assertSame(0, $this->commandTester->getStatusCode());

        $output = $this->commandTester->getDisplay();
        $this->assertStringContainsString('Successfully generated token:', $output);

        $tokensAfter = [...$this->tokenRepository->findPublicApiTokensByUser($user)];
        $countAfter = \count($tokensAfter);

        $this->assertSame($countBefore + 1, $countAfter, 'A new token should have been created');
    }

    public function testCreateTokenGeneratesValidHexToken(): void
    {
        $this->commandTester->execute([
            'userEmail' => self::EXISTING_USER_EMAIL,
        ]);

        $output = $this->commandTester->getDisplay();

        preg_match('/Successfully generated token: ([a-f0-9]+)/', $output, $matches);
        $this->assertNotEmpty($matches[1], 'Token should be captured from output');
        $this->assertSame(32, \strlen($matches[1]), 'Token should be 32 hex characters (16 bytes)');
    }

    public function testCreateTokenForNonExistingUserFails(): void
    {
        $this->commandTester->execute([
            'userEmail' => self::NON_EXISTING_USER_EMAIL,
        ]);

        $this->assertSame(1, $this->commandTester->getStatusCode());

        $output = $this->commandTester->getDisplay();
        $this->assertStringContainsString(self::NON_EXISTING_USER_EMAIL, $output);
    }
}
