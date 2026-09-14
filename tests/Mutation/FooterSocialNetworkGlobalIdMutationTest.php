<?php

namespace Capco\Tests\Mutation;

use Capco\AppBundle\Entity\FooterSocialNetwork;
use Capco\AppBundle\GraphQL\Mutation\FooterSocialNetwork\DeleteFooterSocialNetworkMutation;
use Capco\AppBundle\GraphQL\Mutation\FooterSocialNetwork\UpdateFooterSocialNetworkMutation;
use Capco\AppBundle\Repository\FooterSocialNetworkRepository;
use Doctrine\Common\Cache\ArrayCache;
use Doctrine\ORM\Configuration;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @coversNothing
 */
class FooterSocialNetworkGlobalIdMutationTest extends TestCase
{
    private MockObject & EntityManagerInterface $entityManager;
    private MockObject & FooterSocialNetworkRepository $footerSocialNetworkRepository;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->footerSocialNetworkRepository = $this->createMock(FooterSocialNetworkRepository::class);

        $configuration = new Configuration();
        $configuration->setResultCacheImpl(new ArrayCache());
        $this->entityManager->method('getConfiguration')->willReturn($configuration);
    }

    public function testUpdateDecodesGlobalIdBeforeLookingUpFooterSocialNetwork(): void
    {
        $footerSocialNetwork = (new FooterSocialNetwork())->setId(42);
        $globalId = GlobalId::toGlobalId('FooterSocialNetwork', '42');
        $mutation = new UpdateFooterSocialNetworkMutation($this->footerSocialNetworkRepository, $this->entityManager);

        $this->footerSocialNetworkRepository->expects(self::once())->method('find')->with('42')->willReturn($footerSocialNetwork);
        $this->entityManager->expects(self::once())->method('flush');

        self::assertSame(
            ['footerSocialNetwork' => $footerSocialNetwork, 'errorCode' => null],
            $mutation(new Argument(['input' => ['id' => $globalId]]))
        );
    }

    public function testDeleteReturnsGlobalIdForRelayEdgeDeletion(): void
    {
        $footerSocialNetwork = (new FooterSocialNetwork())->setId(42);
        $globalId = GlobalId::toGlobalId('FooterSocialNetwork', '42');
        $mutation = new DeleteFooterSocialNetworkMutation($this->footerSocialNetworkRepository, $this->entityManager);

        $this->footerSocialNetworkRepository->expects(self::once())->method('find')->with('42')->willReturn($footerSocialNetwork);
        $this->entityManager->expects(self::once())->method('remove')->with($footerSocialNetwork);
        $this->entityManager->expects(self::once())->method('flush');

        self::assertSame(
            ['deletedFooterSocialNetworkId' => $globalId],
            $mutation(new Argument(['input' => ['id' => $globalId]]))
        );
    }
}
