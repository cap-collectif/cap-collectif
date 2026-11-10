<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Service\ParticipationWorkflow\ParticipationCookieManager;
use Capco\AppBundle\Service\ProposalWorkflowAuthentication;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\Annotation\Route;

class ProposalWorkflowAuthenticationController extends AbstractController
{
    /**
     * @Route("/proposal-workflow/authenticate/{token}", name="app_proposal_workflow_authenticate", methods={"GET"}, options={"i18n" = false})
     */
    public function authenticate(string $token, ProposalWorkflowAuthentication $authentication): RedirectResponse
    {
        if ($this->getUser()) {
            throw $this->createAccessDeniedException();
        }
        ['participant' => $participant, 'redirectUrl' => $redirectUrl] = $authentication->consume($token);
        $response = new RedirectResponse($redirectUrl);
        $response->headers->setCookie(Cookie::create(ParticipationCookieManager::PARTICIPANT_COOKIE)
            ->withValue(base64_encode($participant->getToken()))
            ->withSecure(true)
            ->withHttpOnly(false)
            ->withSameSite(Cookie::SAMESITE_LAX));
        $response->headers->set('Cache-Control', 'no-store, private');
        $response->headers->set('Referrer-Policy', 'no-referrer');

        return $response;
    }
}
