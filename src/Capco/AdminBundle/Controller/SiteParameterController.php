<?php

namespace Capco\AdminBundle\Controller;

use Capco\AdminBundle\Controller\CRUDController as Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;

class SiteParameterController extends Controller
{
    /**
     * Redirect the user depending on his choice.
     */
    protected function redirectTo(Request $request, object $object): RedirectResponse
    {
        $url = $this->generateUrl('capco_admin_settings', ['category' => $object->getCategory()]);

        return new RedirectResponse($url);
    }
}
