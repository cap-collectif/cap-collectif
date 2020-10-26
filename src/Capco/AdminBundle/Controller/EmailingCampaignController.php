<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Entity\EmailingCampaign;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\HttpFoundation\Response;

class EmailingCampaignController extends \Sonata\AdminBundle\Controller\CRUDController
{
    public function listAction()
    {
        return $this->renderWithExtraParams('CapcoAdminBundle:Emailing:emailingCampaign.html.twig');
    }

    public function editParametersAction(string $id): Response
    {
        $emailingCampaign = $this->getEmailingCampaignFromGlobalId($id);

        return $emailingCampaign ? $this->renderEdit($emailingCampaign) : $this->redirectToList();
    }

    public function editContentAction(string $id): Response
    {
        $emailingCampaign = $this->getEmailingCampaignFromGlobalId($id);

        return $emailingCampaign ? $this->renderEdit($emailingCampaign) : $this->redirectToList();
    }

    public function editSendingAction(string $id): Response
    {
        $emailingCampaign = $this->getEmailingCampaignFromGlobalId($id);

        return $emailingCampaign ? $this->renderEdit($emailingCampaign) : $this->redirectToList();
    }

    private function getEmailingCampaignFromGlobalId(string $globalId): ?EmailingCampaign
    {
        return $this->admin->getObject(GlobalId::fromGlobalId($globalId)['id']);
    }

    private function renderEdit(EmailingCampaign $emailingCampaign): Response
    {
        return $this->renderWithExtraParams(
            'CapcoAdminBundle:Emailing:emailingCampaignEdit.html.twig',
            [
                'object' => $emailingCampaign,
                'form' => $this->admin->getForm()->createView(),
                'action' => 'edit',
            ]
        );
    }
}
