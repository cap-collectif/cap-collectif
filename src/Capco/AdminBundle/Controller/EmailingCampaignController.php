<?php

namespace Capco\AdminBundle\Controller;

use Symfony\Component\HttpFoundation\Response;

class EmailingCampaignController extends \Sonata\AdminBundle\Controller\CRUDController
{
    public function listAction()
    {
        return $this->renderWithExtraParams('CapcoAdminBundle:Emailing:emailingCampaign.html.twig');
    }

    public function editParametersAction(): Response
    {
        return $this->renderWithExtraParams(
            'CapcoAdminBundle:Emailing:emailingCampaignEdit.html.twig',
            [
                'object' => $this->admin->getSubject(),
                'form' => $this->admin->getForm()->createView(),
                'action' => 'edit',
            ]
        );
    }

    public function editContentAction(): Response
    {
        return $this->renderWithExtraParams(
            'CapcoAdminBundle:Emailing:emailingCampaignEdit.html.twig',
            [
                'object' => $this->admin->getSubject(),
                'form' => $this->admin->getForm()->createView(),
                'action' => 'edit',
            ]
        );
    }

    public function editSendingAction(): Response
    {
        return $this->renderWithExtraParams(
            'CapcoAdminBundle:Emailing:emailingCampaignEdit.html.twig',
            [
                'object' => $this->admin->getSubject(),
                'form' => $this->admin->getForm()->createView(),
                'action' => 'edit',
            ]
        );
    }
}
