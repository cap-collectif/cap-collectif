<?php

declare(strict_types=1);

namespace Capco\Tests\Controller\Api;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Entity\Project;
use Capco\Tests\IdentityWebTestCase;
use Symfony\Component\BrowserKit\Cookie;

/**
 * @runTestsInSeparateProcesses
 *
 * @preserveGlobalState disabled
 *
 * @internal
 */
final class SitemapLocaleTest extends IdentityWebTestCase
{
    public static function featureFlagOverrides(): array
    {
        return [...parent::featureFlagOverrides(), 'multilangue' => true];
    }

    /** @dataProvider languages */
    public function testSitemapOnlyIncludesProjectsInCurrentLanguageOrWithoutLanguage(string $locale): void
    {
        $localeRepository = $this->em->getRepository(Locale::class);
        $french = $localeRepository->findOneBy(['code' => 'fr-FR']);
        $english = $localeRepository->findOneBy(['code' => 'en-GB']);
        self::assertNotNull($french);
        self::assertNotNull($english);
        $english->enable()->publish();

        $projects = array_values(array_filter(
            $this->em->getRepository(Project::class)->findPublicNonArchivedWithSteps(),
            static fn (Project $project): bool => $project->getFirstStep()?->getEnabled() ?? false
        ));
        self::assertGreaterThanOrEqual(3, \count($projects));
        [$frenchProject, $englishProject, $unlocalizedProject] = $projects;
        $frenchProject->setLocale($french);
        $englishProject->setLocale($english);
        $unlocalizedProject->setLocale(null);
        $this->em->flush();

        $included = 'en-GB' === $locale ? $englishProject : $frenchProject;
        $excluded = 'en-GB' === $locale ? $frenchProject : $englishProject;
        $this->browser->getCookieJar()->set(new Cookie('locale', $locale, null, '/', 'capco.test', true));
        $sitemap = $this->graphql('{ sitemap { homeUrl projects { url } } }')['sitemap'];
        self::assertSame('en-GB' === $locale ? '/en/' : '/', $sitemap['homeUrl']);
        $urls = array_column($sitemap['projects'], 'url');
        $paths = array_map(static fn (string $url): string => (string) parse_url($url, \PHP_URL_PATH), $urls);
        $prefix = 'en-GB' === $locale ? '/en/project/' : '/project/';
        self::assertContains($prefix . $included->getSlug(), $paths);
        self::assertContains($prefix . $unlocalizedProject->getSlug(), $paths);
        self::assertNotContains($prefix . $excluded->getSlug(), $paths);
    }

    /** @return array<string, array{string}> */
    public static function languages(): array
    {
        return ['French' => ['fr-FR'], 'English' => ['en-GB']];
    }
}
