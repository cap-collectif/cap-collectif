<?php

namespace Capco\Tests\HttpRedirect;

use Capco\AppBundle\Entity\SiteSettings;
use Capco\AppBundle\HttpRedirect\HttpRedirectUrlNormalizer;
use Capco\AppBundle\Repository\SiteSettingsRepository;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * @internal
 * @coversNothing
 */
class HttpRedirectUrlNormalizerTest extends TestCase
{
    private string|false $previousInstanceName;

    protected function setUp(): void
    {
        $this->previousInstanceName = getenv('SYMFONY_INSTANCE_NAME');
        putenv('SYMFONY_INSTANCE_NAME=test-instance');
    }

    protected function tearDown(): void
    {
        if (false === $this->previousInstanceName) {
            putenv('SYMFONY_INSTANCE_NAME');

            return;
        }

        putenv(sprintf('SYMFONY_INSTANCE_NAME=%s', $this->previousInstanceName));
    }

    public function testItRejectsRelativeUrls(): void
    {
        $normalizer = new HttpRedirectUrlNormalizer($this->createRepositoryMock(), 'capco.dev', new RequestStack());

        self::assertSame('', $normalizer->normalizeSourceUrl('my-slug'));
        self::assertSame('', $normalizer->normalizeSourceUrl('/my-slug?preview=1'));
    }

    public function testItNormalizesAbsoluteUrlsFromPlatformDomains(): void
    {
        $normalizer = new HttpRedirectUrlNormalizer(
            $this->createRepositoryMock('consultation.example.org'),
            'capco.dev',
            new RequestStack()
        );

        self::assertSame(
            '/budget-participatif?step=results',
            $normalizer->normalizeSourceUrl('https://test-instance.cap-collectif.com/budget-participatif?step=results')
        );
        self::assertSame(
            '/nos-projets',
            $normalizer->normalizeSourceUrl('https://capco.dev/nos-projets')
        );
        self::assertSame(
            '/budget-participatif',
            $normalizer->normalizeSourceUrl('https://consultation.example.org/budget-participatif')
        );
    }

    public function testItRejectsAbsoluteUrlsFromAnotherDomain(): void
    {
        $normalizer = new HttpRedirectUrlNormalizer(
            $this->createRepositoryMock('consultation.example.org'),
            'capco.dev',
            new RequestStack()
        );

        self::assertSame('', $normalizer->normalizeSourceUrl('https://google.com/budget-participatif'));
    }

    public function testItPercentEncodesPathsAndQueryStringsToMatchRequestUris(): void
    {
        $normalizer = new HttpRedirectUrlNormalizer($this->createRepositoryMock(), 'capco.dev', new RequestStack());

        self::assertSame(
            '/caf%C3%A9?from=salon%20du%20livre',
            $normalizer->normalizeSourceUrl('https://capco.dev/café?from=salon du livre')
        );
        self::assertSame(
            '/caf%C3%A9?from=salon%20du%20livre',
            $normalizer->normalizeSourceUrl('https://capco.dev/caf%C3%A9?from=salon%20du%20livre')
        );
        self::assertSame(
            '/c++?q=C++',
            $normalizer->normalizeSourceUrl('https://capco.dev/c++?q=C++')
        );
        self::assertSame(
            '/c++?q=C%2B%2B',
            $normalizer->normalizeSourceUrl('https://capco.dev/c++?q=C%2B%2B')
        );
        self::assertSame(
            '/%C3%A9t%C3%A9?from=th%C3%A9%20glac%C3%A9',
            $normalizer->normalizeSourceUrl('https://capco.dev/été?from=thé glacé')
        );
    }

    public function testItAcceptsTheCurrentRequestHost(): void
    {
        $requestStack = new RequestStack();
        $requestStack->push(Request::create('https://capco.test/admin-next/domain-url'));

        $normalizer = new HttpRedirectUrlNormalizer($this->createRepositoryMock(), 'capco.dev', $requestStack);

        self::assertSame('/projects', $normalizer->normalizeSourceUrl('https://capco.test/projects'));
    }

    private function createRepositoryMock(?string $customDomain = null): SiteSettingsRepository
    {
        $siteSettings = new SiteSettings();
        $siteSettings->setCustomDomain($customDomain);

        $repository = $this->createMock(SiteSettingsRepository::class);
        $repository
            ->method('findSiteSetting')
            ->willReturn($siteSettings)
        ;

        return $repository;
    }
}
