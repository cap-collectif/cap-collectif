<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Resolver\UrlResolver;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\HttpFoundation\Request;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalCurrentVotableStepDataLoader;
use Symfony\Component\Routing\RouterInterface;

class ProposalController extends Controller
{
    /**
     * @Route("/projects/{projectSlug}/collect/{stepSlug}/proposals/{proposalSlug}", name="app_project_show_proposal")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @ParamConverter("step", class="CapcoAppBundle:Steps\AbstractStep", options={
     *    "mapping": {"stepSlug": "slug", "projectSlug": "projectSlug"},
     *    "repository_method"="getOneBySlugAndProjectSlug",
     *    "map_method_signature"=true
     * })
     * @ParamConverter("proposal", class="CapcoAppBundle:Proposal", options={"mapping" = {"proposalSlug": "slug"}, "repository_method"= "getOneBySlug", "map_method_signature" = true})
     * @Template("CapcoAppBundle:Proposal:show.html.twig")
     */
    public function showProposalAction(
        Request $request,
        Project $project,
        CollectStep $step,
        Proposal $proposal
    ) {
        $viewer = $this->getUser();

        if ($proposal->isDraft() && $proposal->getAuthor() !== $viewer) {
            throw new NotFoundHttpException(
                sprintf(
                    'The proposal `%s` is in draft state and current user is not the creator.',
                    $proposal->getId()
                )
            );
        }

        if (!$proposal->canDisplay($viewer)) {
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
            ->toArray();

        $referer = $request->headers->get('referer');
        if (
            $request->headers->has('referer') &&
            false !==
                strpos(
                    $referer,
                    $this->get('router')->generate(
                        'app_homepage',
                        [],
                        RouterInterface::ABSOLUTE_URL
                    )
                ) &&
            (false !== strpos($referer, '/selection/') || false !== strpos($referer, '/collect/'))
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
        $currentVotableStepId = $votableStep ? $votableStep->getId() : null;

        if ($votableStep && \in_array($votableStep->getType(), ['collect', 'selection'])) {
            $currentVotableStepId = GlobalId::toGlobalId(
                ucfirst($votableStep->getType()) . 'Step',
                $votableStep->getId()
            );
        }

        return [
            'project' => $project,
            'currentStep' => $step,
            'currentVotableStepId' => $currentVotableStepId,
            'proposal' => $proposal,
            'referer' => $refererUri
        ];
    }
}
