<?php

namespace Capco\AdminBundle\Controller;

use Sonata\AdminBundle\Controller\CRUDController as Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;

class SiteParameterController extends Controller
{
    /**
     * Redirect the user depend on this choice.
     *
     * @param object  $object
     * @param Request $request
     *
     * @return RedirectResponse
     */
    protected function redirectTo($object, Request $request = null)
    {
        $url = $this->generateUrl('capco_admin_settings', ['category' => $object->getCategory()]);

        return new RedirectResponse($url);
    }
}
