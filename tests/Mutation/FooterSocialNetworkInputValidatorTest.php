<?php

namespace Capco\Tests\Mutation;

use Capco\AppBundle\Enum\FooterSocialNetworkErrorCode;
use Capco\AppBundle\GraphQL\Mutation\FooterSocialNetwork\CreateFooterSocialNetworkMutation;
use Capco\AppBundle\GraphQL\Mutation\FooterSocialNetwork\FooterSocialNetworkInputValidator;
use Capco\AppBundle\GraphQL\Mutation\FooterSocialNetwork\UpdateFooterSocialNetworkMutation;
use Capco\AppBundle\Repository\FooterSocialNetworkRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @coversNothing
 */
class FooterSocialNetworkInputValidatorTest extends TestCase
{
    private MockObject & EntityManagerInterface $entityManager;
    private MockObject & FooterSocialNetworkRepository $footerSocialNetworkRepository;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->footerSocialNetworkRepository = $this->createMock(FooterSocialNetworkRepository::class);
    }

    /**
     * @dataProvider provideValidInputs
     *
     * @param array{title: string, link: string, style: string} $input
     */
    public function testAcceptsValuesAtDatabaseColumnLimits(array $input): void
    {
        self::assertNull(FooterSocialNetworkInputValidator::getErrorCode(new Argument($input)));
    }

    /**
     * @dataProvider provideInvalidInputs
     *
     * @param array{title: string, link: string, style: string} $input
     */
    public function testCreateDoesNotPersistValuesExceedingDatabaseColumnLimits(array $input): void
    {
        $mutation = new CreateFooterSocialNetworkMutation($this->footerSocialNetworkRepository, $this->entityManager);

        $this->entityManager->expects(self::never())->method('persist');
        $this->entityManager->expects(self::never())->method('flush');

        self::assertSame(
            ['footerSocialNetwork' => null, 'errorCode' => FooterSocialNetworkErrorCode::VALUE_TOO_LONG],
            $mutation(new Argument(['input' => $input]))
        );
    }

    /**
     * @dataProvider provideInvalidInputs
     *
     * @param array{title: string, link: string, style: string} $input
     */
    public function testUpdateDoesNotPersistValuesExceedingDatabaseColumnLimits(array $input): void
    {
        $mutation = new UpdateFooterSocialNetworkMutation($this->footerSocialNetworkRepository, $this->entityManager);

        $this->footerSocialNetworkRepository->expects(self::never())->method('find');
        $this->entityManager->expects(self::never())->method('flush');

        self::assertSame(
            ['footerSocialNetwork' => null, 'errorCode' => FooterSocialNetworkErrorCode::VALUE_TOO_LONG],
            $mutation(new Argument(['input' => ['id' => 'footer-social-network-id'] + $input]))
        );
    }

    /** @return iterable<string, array{0: array{title: string, link: string, style: string}}> */
    public static function provideValidInputs(): iterable
    {
        yield 'maximum lengths' => [[
            'title' => str_repeat('a', 255),
            'link' => str_repeat('b', 255),
            'style' => str_repeat('c', 20),
        ]];
    }

    /** @return iterable<string, array{0: array{title: string, link: string, style: string}}> */
    public static function provideInvalidInputs(): iterable
    {
        yield 'title' => [[
            'title' => str_repeat('a', 256),
            'link' => 'https://example.test',
            'style' => 'facebook',
        ]];
        yield 'link' => [[
            'title' => 'Facebook',
            'link' => str_repeat('a', 256),
            'style' => 'facebook',
        ]];
        yield 'style' => [[
            'title' => 'Facebook',
            'link' => 'https://example.test',
            'style' => str_repeat('a', 21),
        ]];
    }
}
