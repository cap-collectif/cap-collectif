<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Security\EmailingCampaignVoter;
use Capco\AppBundle\Toggle\Manager;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class EmailingCampaignController extends \Sonata\AdminBundle\Controller\CRUDController
{
    public function listAction(Request $request): Response
    {
        return $this->isFeatureActivated()
            ? $this->renderWithExtraParams('@CapcoAdmin/Emailing/emailingCampaign.html.twig')
            : $this->redirectToHome();
    }

    public function editParametersAction(string $id): Response
    {
        if (!$this->isFeatureActivated()) {
            $this->redirectToHome();
        }

        $emailingCampaign = $this->getEmailingCampaignFromGlobalId($id);

        return $emailingCampaign ? $this->renderEdit($emailingCampaign) : $this->redirectToList();
    }

    public function editContentAction(string $id): Response
    {
        if (!$this->isFeatureActivated()) {
            $this->redirectToHome();
        }

        $emailingCampaign = $this->getEmailingCampaignFromGlobalId($id);

        return $emailingCampaign ? $this->renderEdit($emailingCampaign) : $this->redirectToList();
    }

    public function editSendingAction(string $id): Response
    {
        if (!$this->isFeatureActivated()) {
            $this->redirectToHome();
        }

        $emailingCampaign = $this->getEmailingCampaignFromGlobalId($id);

        return $emailingCampaign ? $this->renderEdit($emailingCampaign) : $this->redirectToList();
    }

    private function getEmailingCampaignFromGlobalId(string $globalId): ?EmailingCampaign
    {
        $campaign = $this->admin->getObject(GlobalId::fromGlobalId($globalId)['id']);

        if (!$this->isGranted(EmailingCampaignVoter::VIEW, $campaign)) {
            throw $this->createAccessDeniedException();
        }

        return $campaign;
    }

    private function renderEdit(EmailingCampaign $emailingCampaign): Response
    {
        $this->admin->setSubject($emailingCampaign);

        return $this->renderWithExtraParams(
            '@CapcoAdmin/Emailing/emailingCampaignEdit.html.twig',
            [
                'object' => $emailingCampaign,
                'form' => $this->admin->getForm()->createView(),
                'action' => 'edit',
            ]
        );
    }

    private function isFeatureActivated(): bool
    {
        return $this->get(Manager::class)->isActive(Manager::emailing);
    }

    private function redirectToHome(): RedirectResponse
    {
        return new RedirectResponse($this->generateUrl('app_homepage'));
    }
}
