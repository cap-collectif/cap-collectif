<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Toggle\Manager;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\Annotation\Route;

class EmailingParametersController extends AbstractController
{
    /**
     * @Security("has_role('ROLE_ADMIN')")
     * @Route("/admin/mailingParameters", name="admin_capco_mailing_parameters")
     * @Route("/admin/mailingParameters/list", name="admin_capco_mailing_parameters_deprecated")
     * @Template("@CapcoAdmin/Emailing/emailingParameters.html.twig")
     */
    public function listAction()
    {
        return $this->isFeatureActivated() ? [] : $this->redirectToHome();
    }

    private function isFeatureActivated(): bool
    {
        return $this->get(Manager::class)->isActive(Manager::emailing_parameters);
    }

    private function redirectToHome(): RedirectResponse
    {
        return new RedirectResponse($this->generateUrl('app_homepage'));
    }
}
