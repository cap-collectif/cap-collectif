<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\GraphQL\Mutation\Locale\SetUserDefaultLocaleMutation;
use Capco\AppBundle\Locale\DefaultLocaleCodeDataloader;
use Capco\AppBundle\Repository\LocaleRepository;
use FOS\RestBundle\Controller\AbstractFOSRestController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Routing\Annotation\Route;

class LocaleController extends AbstractFOSRestController
{
    private $localeRepository;
    private $router;
    private $userDefaultLocaleMutation;
    private $defaultLocaleCodeDataloader;

    public function __construct(
        LocaleRepository $localeRepository,
        RouterInterface $router,
        DefaultLocaleCodeDataloader $defaultLocaleCodeDataloader,
        SetUserDefaultLocaleMutation $userDefaultLocaleMutation
    ) {
        $this->localeRepository = $localeRepository;
        $this->router = $router;
        $this->userDefaultLocaleMutation = $userDefaultLocaleMutation;
        $this->defaultLocaleCodeDataloader = $defaultLocaleCodeDataloader;
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
            $locale = $this->localeRepository->findOneBy([
                'code' => $localeCode,
                'published' => true,
            ]);
            if (!$locale || !($locale instanceof Locale)) {
                throw new BadRequestHttpException(
                    "The locale with code ${localeCode} does not exist or is not enabled."
                );
            }
        }
        $request->setLocale($localeCode);
        $keptParams['_locale'] = $localeCode;

        try {
            $redirectPath = $this->router->generate($routeName, $keptParams);
            $defaultLocaleCode = $this->defaultLocaleCodeDataloader->__invoke();
            if (
                $localeCode !== $defaultLocaleCode &&
                0 !== strpos($redirectPath, '/' . substr($localeCode, 0, 2) . '/')
            ) {
                $redirectPath = $this->router->generate('app_homepage', $localeCode);
            }
        } catch (\Exception $exception) {
            $redirectPath = $this->router->generate('app_homepage', ['_locale' => $localeCode]);
        }

        return new JsonResponse([
            'locale' => $localeCode,
            'path' => $redirectPath,
        ]);
    }
}
