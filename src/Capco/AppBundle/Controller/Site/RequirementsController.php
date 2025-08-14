<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Step\StepUrlResolver;
use Capco\AppBundle\Service\ContributionValidator;
use Capco\AppBundle\Service\ParticipantHelper;
use Capco\AppBundle\Service\ParticipationWorkflow\ParticipationCookieManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

class RequirementsController extends Controller
{
    public function __construct(private readonly GlobalIdResolver $globalIdResolver, private readonly TranslatorInterface $translator, private readonly ContributionValidator $contributionValidator, private readonly StepUrlResolver $stepUrlResolver, private readonly ParticipantHelper $participantHelper)
    {
    }

    /**
     * @Route("/requirements/step/{stepId}/contribution/{contributionId}", name="requirements", options={"i18n" = false})
     */
    public function indexAction(Request $request, string $stepId, string $contributionId): Response
    {
        $step = $this->globalIdResolver->resolve($stepId, $this->getUser());

        if (!$step instanceof AbstractStep) {
            return $this->redirectToRoute('app_homepage');
        }

        if ($step->isClosed()) {
            $this->addFlash(
                'danger',
                $this->translator->trans('step.closed.error', [], 'CapcoAppBundle')
            );

            return $this->redirectToRoute('app_homepage');
        }

        $participantToken = $request->cookies->get(ParticipationCookieManager::PARTICIPANT_COOKIE);

        try {
            $participant = $this->participantHelper->getParticipantByToken($participantToken);
        } catch (ParticipantNotFoundException) {
            $participant = null;
        }

        $user = $this->getUser();

        if (!$user && !$participantToken) {
            return $this->render('@CapcoApp/Requirements/index.html.twig', ['stepId' => $stepId, 'contributionId' => $contributionId]);
        }

        $contributor = $user ?? $participant;

        if (!$this->contributionValidator->canContributeAgain($step, $contributor)) {
            $url = $this->stepUrlResolver->__invoke($step) . '?toast={"variant":"danger","message":"participant-already-contributed-title"} ';

            return $this->redirect($url);
        }

        return $this->render('@CapcoApp/Requirements/index.html.twig', ['stepId' => $stepId, 'contributionId' => $contributionId]);
    }
}
