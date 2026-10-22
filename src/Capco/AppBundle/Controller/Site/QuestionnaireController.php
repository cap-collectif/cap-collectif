<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Repository\ParticipantRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

class QuestionnaireController extends AbstractController
{
    /**
     * @Route("/confirmAnonymousEmail", name="capco_app_questionnaire_confirm_anonymous_email", options={"i18n" = false})
     */
    public function confirmAnonymousEmail(
        ParticipantRepository $repository,
        EntityManagerInterface $entityManager,
        LoggerInterface $logger,
        TranslatorInterface $translator,
        Request $request
    ): RedirectResponse {
        $token = $request->get('token') ?? '';
        $participant = $repository->findOneBy(['confirmationToken' => $token]);
        if (null === $participant) {
            $logger->info("invalid token {$token} used to confirm anonymous email");
            $this->addFlash('danger', $translator->trans('invalid-token', [], 'CapcoAppBundle'));

            return $this->redirectToRoute('app_homepage');
        }

        if ($participant->isEmailConfirmed()) {
            $this->addFlash(
                'danger',
                $translator->trans('email.published.already', [], 'CapcoAppBundle')
            );

            return $this->redirectToRoute('app_homepage');
        }

        $participant->setConfirmationToken(null);
        $entityManager->flush();
        $this->addFlash(
            'success',
            $translator->trans('thanks-email-confirmation', [], 'CapcoAppBundle')
        );

        return $this->redirectToRoute('app_homepage');
    }
}
