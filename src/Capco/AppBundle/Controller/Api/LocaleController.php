<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\GraphQL\Mutation\Locale\SetUserDefaultLocaleMutation;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Repository\PageRepository;
use Capco\AppBundle\Router\DefaultPatternGenerationStrategy;
use Psr\Log\LoggerInterface;
use Psr\Log\LogLevel;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class LocaleController extends AbstractController
{
    public function __construct(
        private readonly LocaleRepository $localeRepository,
        private readonly PageRepository $pageRepository,
        private readonly RouterInterface $router,
        private readonly SetUserDefaultLocaleMutation $userDefaultLocaleMutation,
        private readonly TranslatorInterface $translator,
        private readonly LoggerInterface $logger
    ) {
    }

    /**
     * @Route("/api/change-locale/{localeCode}", name="change_locale", defaults={"_feature_flags" = "multilangue"})
     */
    public function setUserLocale(Request $request, string $localeCode): JsonResponse
    {
        $user = $this->getUser();

        $requestBody = json_decode($request->getContent(), true);
        // Optional: allow clients to send the current path so we can return a locale-prefixed URL.
        $currentPath = $requestBody['currentPath'] ?? null;
        $routeName = $requestBody['routeName'] ?? null;
        $params = $requestBody['routeParams'] ?? [];

        $keptParams = $params['_route_params'] ?? [];

        if (null !== $user) {
            $this->userDefaultLocaleMutation->setUserDefaultLocale($user, $localeCode);
        } else {
            $this->checkLocaleIsPublished($localeCode);
        }
        self::updateRequestLocale($request, $localeCode);
        $redirectPath = $this->getRedirectPathFromCurrentPath($currentPath, $localeCode);
        if (!$redirectPath) {
            if (!$routeName) {
                $routeName = 'app_homepage';
            }
            $keptParams['_locale'] = $localeCode;
            $this->handlePageSlug($routeName, $keptParams);
            $redirectPath = $this->getRedirectPath($routeName, $keptParams);
        }

        return new JsonResponse([
            'locale' => $localeCode,
            'path' => $redirectPath,
        ]);
    }

    private function checkLocaleIsPublished(string $localeCode): void
    {
        if (!$this->localeRepository->isCodePublished($localeCode)) {
            throw new BadRequestHttpException("The locale with code {$localeCode} does not exist or is not enabled.");
        }
    }

    private static function updateRequestLocale(Request $request, string $localeCode): void
    {
        $request->setLocale($localeCode);
        $request->getSession()->set('_locale', $localeCode);
    }

    private function getRedirectPath(string $routeName, array $params): string
    {
        try {
            $redirectPath = $this->router->generate($routeName, $params);
        } catch (\Exception $exception) {
            $this->logger->log(LogLevel::ERROR, $exception->getMessage());
            $redirectPath = $this->router->generate('app_homepage', [
                '_locale' => $params['_locale'],
            ]);
        }

        return $redirectPath;
    }

    private function handlePageSlug(?string $routeName, array &$params): void
    {
        if (
            $routeName
            && isset($params['slug'], $params['_locale'])
            && 'app_page_show' === $routeName
        ) {
            if (!$this->handleCharterSlug($params)) {
                $page = $this->pageRepository->getBySlug($params['slug']);
                if ($page && ($slug = $page->getSlug($params['_locale']))) {
                    $params['slug'] = $slug;
                }
            }
        }
    }

    /**
     * Charter is a particular case where we have to translate the slug.
     * Return true if slug matches a charter.
     */
    private function handleCharterSlug(array &$params): bool
    {
        foreach ($this->localeRepository->findPublishedLocales() as $locale) {
            $translation = $this->translator->trans(
                'charter',
                [],
                'CapcoAppBundle',
                $locale->getCode()
            );
            if ($params['slug'] === strtolower($translation)) {
                $params['slug'] = strtolower(
                    $this->translator->trans('charter', [], 'CapcoAppBundle', $params['_locale'])
                );

                return true;
            }
        }

        return false;
    }

    private function getRedirectPathFromCurrentPath(?string $currentPath, string $localeCode): ?string
    {
        if (!\is_string($currentPath) || '' === $currentPath) {
            return null;
        }

        $parsed = parse_url($currentPath);
        if (false === $parsed) {
            return null;
        }
        $path = $parsed['path'] ?? '/';
        if ('' === $path) {
            $path = '/';
        }
        if ('/' !== $path[0]) {
            $path = '/' . ltrim($path, '/');
        }

        $prefixes = $this->getAvailableLocalePrefixes();
        $parts = array_values(array_filter(
            explode('/', $path),
            static fn (string $value): bool => '' !== $value
        ));
        if (isset($parts[0]) && \in_array($parts[0], $prefixes, true)) {
            array_shift($parts);
        }

        $basePath = '/' . implode('/', $parts);
        if ('/' === $basePath) {
            $basePath = '';
        }
        $prefix = DefaultPatternGenerationStrategy::getLocalePrefix($localeCode);
        $localizedPath = '/' . $prefix . $basePath;

        if (isset($parsed['query']) && '' !== $parsed['query']) {
            $localizedPath .= '?' . $parsed['query'];
        }
        if (isset($parsed['fragment']) && '' !== $parsed['fragment']) {
            $localizedPath .= '#' . $parsed['fragment'];
        }

        return $localizedPath;
    }

    /**
     * @return string[]
     */
    private function getAvailableLocalePrefixes(): array
    {
        $prefixes = array_map(
            fn ($locale) => DefaultPatternGenerationStrategy::getLocalePrefix($locale->getCode()),
            $this->localeRepository->findPublishedLocales()
        );

        return array_values(array_unique($prefixes));
    }
}
