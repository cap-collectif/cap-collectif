<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\GraphQL\Mutation\Locale\SetUserDefaultLocaleMutation;
use Capco\AppBundle\Locale\DefaultLocaleCodeDataloader;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Repository\PageRepository;
use FOS\RestBundle\Controller\AbstractFOSRestController;
use Psr\Log\LoggerInterface;
use Psr\Log\LogLevel;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

class LocaleController extends AbstractFOSRestController
{
    private LocaleRepository $localeRepository;
    private PageRepository $pageRepository;
    private RouterInterface $router;
    private SetUserDefaultLocaleMutation $userDefaultLocaleMutation;
    private DefaultLocaleCodeDataloader $defaultLocaleCodeDataloader;
    private TranslatorInterface $translator;
    private LoggerInterface $logger;

    public function __construct(
        LocaleRepository $localeRepository,
        PageRepository $pageRepository,
        RouterInterface $router,
        DefaultLocaleCodeDataloader $defaultLocaleCodeDataloader,
        SetUserDefaultLocaleMutation $userDefaultLocaleMutation,
        TranslatorInterface $translator,
        LoggerInterface $logger
    ) {
        $this->localeRepository = $localeRepository;
        $this->pageRepository = $pageRepository;
        $this->router = $router;
        $this->userDefaultLocaleMutation = $userDefaultLocaleMutation;
        $this->defaultLocaleCodeDataloader = $defaultLocaleCodeDataloader;
        $this->translator = $translator;
        $this->logger = $logger;
    }

    /**
     * @Route("/api/change-locale/{localeCode}", name="change_locale", defaults={"_feature_flags" = "multilangue"})
     */
    public function setUserLocale(Request $request, string $localeCode): JsonResponse
    {
        $user = $this->getUser();
        $routeName = $request->request->get('routeName', 'app_homepage');
        $params = $request->request->get('routeParams', []);
        $keptParams = $params['_route_params'] ?? [];

        if (null !== $user) {
            $this->userDefaultLocaleMutation->setUserDefaultLocale($user, $localeCode);
        } else {
            $this->checkLocaleIsPublished($localeCode);
        }
        self::updateRequestLocale($request, $localeCode);
        $keptParams['_locale'] = $localeCode;

        $this->handlePageSlug($routeName, $keptParams);
        $redirectPath = $this->getRedirectPath($routeName, $keptParams);

        return new JsonResponse([
            'locale' => $localeCode,
            'path' => $redirectPath,
        ]);
    }

    private function checkLocaleIsPublished(string $localeCode): void
    {
        if (!$this->localeRepository->isCodePublished($localeCode)) {
            throw new BadRequestHttpException(
                "The locale with code ${localeCode} does not exist or is not enabled."
            );
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
            $routeName &&
            isset($params['slug'], $params['_locale']) &&
            'app_page_show' === $routeName
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
}
