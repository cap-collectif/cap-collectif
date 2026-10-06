<?php

namespace Capco\Tests\Service;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\AppBundle\Service\ParticipantHelper;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Security\Csrf\TokenGenerator\TokenGeneratorInterface;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Public token resolution uses repository and token-generator stubs with explicit identity outcomes.
 */
final class ParticipantHelperTest extends TestCase
{
    /** @dataProvider existingTokens */
    public function testExistingRawAndEncodedTokensResolveWithoutCreatingIdentity(string $token): void
    {
        $participant = (new Participant())->setToken('existing-token');
        $repository = $this->createStub(ParticipantRepository::class);
        $repository->method('findByTokens')->willReturnCallback(static fn (string $raw, string $decoded): ?Participant => 'existing-token' === $raw || 'existing-token' === $decoded ? $participant : null);
        $generator = $this->createStub(TokenGeneratorInterface::class);
        $generator->method('generateToken')->willReturn('unexpected-new-token');
        $em = $this->createStub(EntityManagerInterface::class);
        $helper = new ParticipantHelper($repository, $generator, $em);
        self::assertSame($participant, $helper->getOrCreateParticipant($token));
        self::assertSame('existing-token', $participant->getToken());
    }

    /** @return iterable<string, array{string}> */
    public static function existingTokens(): iterable
    {
        yield 'raw' => ['existing-token'];
        yield 'encoded' => [base64_encode('existing-token')];
    }

    /** @dataProvider missingTokens */
    public function testMissingIdentityIsRefused(?string $token): void
    {
        $repository = $this->createStub(ParticipantRepository::class);
        $repository->method('findByTokens')->willReturn(null);
        $em = $this->createStub(EntityManagerInterface::class);
        $helper = new ParticipantHelper($repository, $this->createStub(TokenGeneratorInterface::class), $em);
        $this->expectException(ParticipantNotFoundException::class);
        $helper->getParticipantByToken($token);
    }

    /** @return iterable<string, array{?string}> */
    public static function missingTokens(): iterable
    {
        yield 'absent' => [null];
        yield 'empty' => [''];
        yield 'unknown' => ['missing-token'];
    }

    public function testUnknownTokenCreatesFreshIdentityInsteadOfReusingSuppliedToken(): void
    {
        $repository = $this->createStub(ParticipantRepository::class);
        $repository->method('findByTokens')->willReturn(null);
        $generator = $this->createStub(TokenGeneratorInterface::class);
        $generator->method('generateToken')->willReturnOnConsecutiveCalls('fresh-one', 'fresh-two');
        $em = $this->createStub(EntityManagerInterface::class);
        $helper = new ParticipantHelper($repository, $generator, $em);
        $first = $helper->getOrCreateParticipant('unknown');
        $second = $helper->getOrCreateParticipant();
        self::assertNotSame($first, $second);
        self::assertSame('fresh-one', $first->getToken());
        self::assertSame('fresh-two', $second->getToken());
    }
}
