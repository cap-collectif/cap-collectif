<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Repository\LocaleRepository;
use FOS\RestBundle\Controller\AbstractFOSRestController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Routing\Annotation\Route;

class LocaleController extends AbstractFOSRestController
{
    private $localeRepository;
    private $router;

    public function __construct(LocaleRepository $localeRepository, RouterInterface $router)
    {
        $this->localeRepository = $localeRepository;
        $this->router = $router;
    }


    /**
     * @Route("/api/change-locale/{localeCode}", name="change_locale", defaults={"_feature_flags" = "unstable__multilangue"})
     */
    public function setUserLocale(Request $request, string $localeCode): JsonResponse
    {
        $routeName = $request->request->get('routeName', 'app_homepage');
        $routeParams = $request->request->get('routeParams', []);
        $locale = $this->localeRepository->findOneBy(['code' => $localeCode]);
        if (!($locale instanceof Locale)) {
            throw new BadRequestHttpException("unknown locale : ${localeCode}");
        }
        if (!$locale->isPublished()) {
            throw new BadRequestHttpException("The locale ${localeCode} is not published");
        }
        $request->setLocale($localeCode);

        return new JsonResponse([
            '_locale' => $localeCode,
            'path' => $this->router->generate(
                $routeName,
                array_merge(['_locale' => $localeCode], $routeParams)
            )
        ]);
    }
}
