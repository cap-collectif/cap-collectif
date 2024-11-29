<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalCurrentVotableStepDataLoader;
use Capco\AppBundle\Resolver\UrlResolver;
use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class ProposalController extends Controller
{
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
            ->map(function (ProjectAbstractStep $step) use ($urlResolver) {
                return $urlResolver->getStepUrl(
                    $step->getStep(),
                    UrlGeneratorInterface::ABSOLUTE_URL
                );
            })
            ->toArray()
        ;

        $referer = $request->headers->get('referer');
        if (
            $request->headers->has('referer')
            && false !==
                strpos(
                    (string) $referer,
                    (string) $this->get('router')->generate(
                        'app_homepage',
                        [],
                        RouterInterface::ABSOLUTE_URL
                    )
                )
            && (false !== strpos((string) $referer, '/selection/') || false !== strpos((string) $referer, '/collect/'))
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
}
