<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\HttpFoundation\RedirectResponse;

class EmailingParametersController extends \Sonata\AdminBundle\Controller\CRUDController
{
    public function listAction()
    {
        return $this->isFeatureActivated()
            ? $this->renderWithExtraParams('CapcoAdminBundle:Emailing:emailingParameters.html.twig')
            : $this->redirectToHome();
    }

    private function isFeatureActivated(): bool
    {
        return $this->get(Manager::class)->isActive(Manager::unstable__emailing_parameters);
    }

    private function redirectToHome(): RedirectResponse
    {
        return new RedirectResponse($this->generateUrl('app_homepage'));
    }
}
