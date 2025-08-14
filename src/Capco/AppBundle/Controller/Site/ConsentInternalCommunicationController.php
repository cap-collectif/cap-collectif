<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Service\ParticipantHelper;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

class ConsentInternalCommunicationController extends Controller
{
    public function __construct(private readonly ParticipantHelper $participantHelper, private readonly EntityManagerInterface $em, private readonly TranslatorInterface $translator)
    {
    }

    /**
     * @Route("/consent-internal-communication/{email}/{token}", name="participant_consent_internal_communication", options={"i18n" = false})
     */
    public function participantConsentInternalCommunicationAction(string $email, string $token): Response
    {
        $participant = $this->participantHelper->getParticipantByToken($token);
        $participant->setConsentInternalCommunication(true);
        $participant->setEmail($email);

        $this->em->flush();

        $this->addFlash('success', $this->translator->trans('thank-you-you-are-subscribed-to-newsletter'));

        return $this->redirectToRoute('app_homepage');
    }
}
