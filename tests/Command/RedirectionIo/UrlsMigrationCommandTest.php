<?php

namespace Capco\Tests\Command\RedirectionIo;

use Capco\AppBundle\Command\RedirectionIo\UrlsMigrationCommand;
use Capco\AppBundle\HttpRedirect\HttpRedirectCacheInvalidator;
use Capco\AppBundle\HttpRedirect\HttpRedirectUrlNormalizer;
use Capco\AppBundle\Repository\HttpRedirectRepository;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Response;

/**
 * @internal
 * @coversNothing
 */
class UrlsMigrationCommandTest extends TestCase
{
    private MockObject & HttpRedirectUrlNormalizer $httpRedirectUrlNormalizer;

    protected function setUp(): void
    {
        $this->httpRedirectUrlNormalizer = $this->createMock(HttpRedirectUrlNormalizer::class);
    }

    public function testItNormalizesMultibyteSourceUrlsWithoutDroppingCharacters(): void
    {
        $command = new UrlsMigrationCommand(
            $this->createMock(EntityManagerInterface::class),
            $this->createMock(HttpRedirectRepository::class),
            $this->createMock(HttpRedirectCacheInvalidator::class),
            $this->httpRedirectUrlNormalizer
        );

        $normalizeSourceUrl = new \ReflectionMethod($command, 'normalizeSourceUrl');
        $this->httpRedirectUrlNormalizer
            ->expects(self::once())
            ->method('normalizeSourceUrl')
            ->with('https://capco.dev/été?from=thé glacé')
            ->willReturn('/%C3%A9t%C3%A9?from=th%C3%A9%20glac%C3%A9')
        ;

        self::assertSame(
            '/%C3%A9t%C3%A9?from=th%C3%A9%20glac%C3%A9',
            $normalizeSourceUrl->invoke($command, 'https://capco.dev/été?from=thé glacé')
        );
    }

    public function testItRejectsSourceUrlsRejectedByTheRuntimeNormalizer(): void
    {
        $command = new UrlsMigrationCommand(
            $this->createMock(EntityManagerInterface::class),
            $this->createMock(HttpRedirectRepository::class),
            $this->createMock(HttpRedirectCacheInvalidator::class),
            $this->httpRedirectUrlNormalizer
        );

        $normalizeSourceUrl = new \ReflectionMethod($command, 'normalizeSourceUrl');
        $this->httpRedirectUrlNormalizer
            ->expects(self::once())
            ->method('normalizeSourceUrl')
            ->with('https://google.com/projects')
            ->willReturn('')
        ;

        self::assertNull($normalizeSourceUrl->invoke($command, 'https://google.com/projects'));
    }

    public function testItMaps307And308ToSupportedStatusCodes(): void
    {
        $command = new UrlsMigrationCommand(
            $this->createMock(EntityManagerInterface::class),
            $this->createMock(HttpRedirectRepository::class),
            $this->createMock(HttpRedirectCacheInvalidator::class),
            $this->httpRedirectUrlNormalizer
        );

        $getSupportedStatusCode = new \ReflectionMethod($command, 'getSupportedStatusCode');

        self::assertSame(Response::HTTP_FOUND, $getSupportedStatusCode->invoke($command, Response::HTTP_TEMPORARY_REDIRECT));
        self::assertSame(Response::HTTP_MOVED_PERMANENTLY, $getSupportedStatusCode->invoke($command, Response::HTTP_PERMANENTLY_REDIRECT));
    }
}
