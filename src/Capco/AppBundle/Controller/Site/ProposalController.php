<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalCurrentVotableStepDataLoader;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Resolver\UrlResolver;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ProposalController extends Controller
{
    public function __construct(
        private readonly ProposalRepository $proposalRepository,
        private readonly TranslatorInterface $translator,
        private readonly EntityManagerInterface $em,
    ) {
    }

    /**
     * @Route("/project/{projectSlug}/collect/{stepSlug}/proposals/{proposalSlug}", name="app_project_show_proposal", options={"i18n" = false})
     * @Entity("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @Entity("step", class="CapcoAppBundle:Steps\CollectStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     * @Entity("proposal", class="CapcoAppBundle:Proposal", options={"mapping" = {"proposalSlug": "slug"}, "repository_method"= "getOneBySlug", "map_method_signature" = true})
     * @Template("@CapcoApp/Proposal/show.html.twig")
     */
    public function showProposalAction(
        Request $request,
        Project $project,
        CollectStep $step,
        Proposal $proposal
    ) {
        $viewer = $this->getUser();

        if ($proposal->isDraft() && $proposal->getAuthor() !== $viewer) {
            throw new NotFoundHttpException(sprintf('The proposal `%s` is in draft state and current user is not the creator.', $proposal->getId()));
        }

        if (!$proposal->viewerCanSee($viewer)) {
            throw new ProjectAccessDeniedException();
        }

        $urlResolver = $this->get(UrlResolver::class);

        $stepUrls = $project
            ->getSteps()
            ->map(fn (ProjectAbstractStep $step) => $urlResolver->getStepUrl(
                $step->getStep(),
                UrlGeneratorInterface::ABSOLUTE_URL
            ))
            ->toArray()
        ;

        $referer = $request->headers->get('referer');
        if (
            $request->headers->has('referer')
            && str_contains(
                (string) $referer,
                (string) $this->get('router')->generate(
                    'app_homepage',
                    [],
                    RouterInterface::ABSOLUTE_URL
                )
            )
            && (str_contains((string) $referer, '/selection/') || str_contains((string) $referer, '/collect/'))
        ) {
            $refererUri = $referer;
        } else {
            $refererUri = \in_array(
                $urlResolver->getStepUrl($step, UrlGeneratorInterface::ABSOLUTE_URL),
                $stepUrls,
                true
            )
                ? $urlResolver->getStepUrl($step, UrlGeneratorInterface::ABSOLUTE_URL)
                : $request->headers->get('referer');
        }

        $votableStep = $this->get(ProposalCurrentVotableStepDataLoader::class)->resolve($proposal);
        $currentVotableStep = $votableStep ?: null;
        $currentVotableStepId = $votableStep ? $votableStep->getId() : null;

        if ($votableStep && \in_array($votableStep->getType(), ['collect', 'selection'])) {
            $currentVotableStepId = GlobalId::toGlobalId(
                ucfirst((string) $votableStep->getType()) . 'Step',
                $votableStep->getId()
            );
        }

        return [
            'project' => $project,
            'currentStep' => $step,
            'currentVotableStepId' => $currentVotableStepId,
            'currentVotableStep' => $votableStep,
            'proposal' => $proposal,
            'referer' => $refererUri,
        ];
    }

    /**
     * @Route("/projects/{projectSlug}/collect/{stepSlug}/proposals/{proposalSlug}", name="app_project_show_proposal_legacy", options={"i18n" = false})
     */
    public function showProposalActionDeprecated(
        Request $request
    ) {
        return $this->redirect(preg_replace('/\/projects\//', '/project/', $request->getUri()));
    }

    /**
     * @Route("/proposal/consent_internal_communication/{token}", name="app_proposal_consent_internal_communication", options={"i18n" = false})
     */
    public function proposalConsentInternalCommunicationAction(string $token): Response
    {
        /** * @var Proposal $proposal  */
        $proposal = $this->proposalRepository->findOneBy(['consentInternalCommunicationToken' => $token]);

        if (!$proposal) {
            $this->redirectToRoute('app_homepage');
        }

        /**
         * @var User $author
         */
        $author = $proposal->getAuthor();
        $author->setConsentInternalCommunication(true);
        $proposal->setConsentInternalCommunicationToken(null);

        $this->em->flush();

        $this->addFlash(
            'success',
            $this->translator->trans(
                'thank-you-you-are-subscribed-to-newsletter',
                [],
                'CapcoAppBundle'
            )
        );

        $routeParams = [
            'projectSlug' => $proposal->getProject()->getSlug(),
            'stepSlug' => $proposal->getStep()->getSlug(),
            'proposalSlug' => $proposal->getSlug(),
        ];

        return $this->redirectToRoute('app_project_show_proposal', $routeParams);
    }
}
