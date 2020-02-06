<?php

namespace Capco\AppBundle\Controller\Api;


use FOS\RestBundle\Controller\AbstractFOSRestController;
use FOS\RestBundle\Controller\Annotations\Get;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;

class LocaleController extends AbstractFOSRestController
{
    //TODO Used by sonata to change locale -> to delete after refacto
    /**
     * @Get("/locale/{locale}")
     * @param Request $request
     * @param string $locale
     * @return JsonResponse
     */
    public function setLocale(Request $request, string $locale){
        $session = $request->getSession();
        if (!$session || !$session->isStarted()){
            $session = new Session();
            $session->start();
        }
        $session->set('_locale', $locale);
        $request->setLocale($locale);
        return new JsonResponse(['_locale' => $request->getLocale()]);
    }
}
