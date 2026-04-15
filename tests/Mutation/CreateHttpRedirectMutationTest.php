<?php

namespace Capco\Tests\Mutation;

use Capco\AppBundle\Entity\HttpRedirect;
use Capco\AppBundle\Enum\HttpRedirectDuration;
use Capco\AppBundle\Enum\HttpRedirectType;
use Capco\AppBundle\GraphQL\Mutation\HttpRedirect\CreateHttpRedirectMutation;
use Capco\AppBundle\HttpRedirect\HttpRedirectCacheInvalidator;
use Capco\AppBundle\HttpRedirect\HttpRedirectUrlNormalizer;
use Capco\AppBundle\Repository\HttpRedirectRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @coversNothing
 */
class CreateHttpRedirectMutationTest extends TestCase
{
    private MockObject & EntityManagerInterface $entityManager;
    private MockObject & HttpRedirectRepository $httpRedirectRepository;
    private MockObject & HttpRedirectUrlNormalizer $urlNormalizer;
    private MockObject & HttpRedirectCacheInvalidator $cacheInvalidator;
    private CreateHttpRedirectMutation $mutation;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->httpRedirectRepository = $this->createMock(HttpRedirectRepository::class);
        $this->urlNormalizer = $this->createMock(HttpRedirectUrlNormalizer::class);
        $this->cacheInvalidator = $this->createMock(HttpRedirectCacheInvalidator::class);

        $this->mutation = new CreateHttpRedirectMutation(
            $this->entityManager,
            $this->httpRedirectRepository,
            $this->urlNormalizer,
            $this->cacheInvalidator
        );
    }

    public function testUrlShorteningDefaultsToTemporaryRedirect(): void
    {
        $args = new Argument(['input' => [
            'sourceUrl' => '/go/budget',
            'destinationUrl' => 'https://example.org/very/long/path',
            'redirectType' => HttpRedirectType::URL_SHORTENING,
        ]]);

        $this->urlNormalizer
            ->method('normalizeSourceUrl')
            ->with('/go/budget')
            ->willReturn('/go/budget')
        ;
        $this->httpRedirectRepository
            ->method('isSourceUrlUsed')
            ->with('/go/budget')
            ->willReturn(false)
        ;

        $persistedRedirect = null;
        $this->entityManager
            ->expects($this->once())
            ->method('persist')
            ->with(self::callback(function (HttpRedirect $redirect) use (&$persistedRedirect): bool {
                $persistedRedirect = $redirect;

                return true;
            }))
        ;
        $this->entityManager->expects($this->once())->method('flush');
        $this->cacheInvalidator->expects($this->once())->method('invalidateAll');

        $result = $this->mutation->__invoke($args);

        self::assertNull($result['errorCode']);
        self::assertInstanceOf(HttpRedirect::class, $persistedRedirect);
        self::assertSame(HttpRedirectDuration::TEMPORARY, $persistedRedirect->getDuration());
        self::assertSame(HttpRedirectType::URL_SHORTENING, $persistedRedirect->getRedirectType());
    }
}
