<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Resolver\UrlResolver;
use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class ProposalController extends Controller
{
    /**
     * @Route("/projects/{projectSlug}/collect/{stepSlug}/proposals/{proposalSlug}", name="app_project_show_proposal")
     * @ParamConverter("project", class="CapcoAppBundle:Project", options={"mapping" = {"projectSlug": "slug"}, "repository_method"= "getOneWithoutVisibility", "map_method_signature" = true})
     * @ParamConverter("collectStep", class="CapcoAppBundle:Steps\CollectStep", options={"mapping" = {"stepSlug": "slug"}, "repository_method"= "getOneBySlug", "map_method_signature" = true})
     * @ParamConverter("proposal", class="CapcoAppBundle:Proposal", options={"mapping" = {"proposalSlug": "slug"}, "repository_method"= "getOneBySlug", "map_method_signature" = true})
     * @Template("CapcoAppBundle:Proposal:show.html.twig")
     */
    public function showProposalAction(
        Request $request,
        Project $project,
        CollectStep $collectStep,
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

        $serializer = $this->get('serializer');
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

        $refererUri =
            $request->headers->has('referer') &&
            false !== filter_var($request->headers->get('referer'), FILTER_VALIDATE_URL) &&
            \in_array($request->headers->get('referer'), $stepUrls, true)
                ? $request->headers->get('referer')
                : $urlResolver->getStepUrl($collectStep, UrlGeneratorInterface::ABSOLUTE_URL);

        $votableStep = $this->get(
            'capco\appbundle\graphql\resolver\proposal\proposalcurrentvotablestepresolver'
        )->__invoke($proposal);

        $props = $serializer->serialize(
            [
                'proposalId' => $proposal->getId(),
                'currentVotableStepId' => $votableStep ? $votableStep->getId() : null,
            ],
            'json',
            [
                'groups' => [
                    'ProposalCategories',
                    'UserVotes',
                    'Districts',
                    'ProposalForms',
                    'Questions',
                    'Steps',
                    'ThemeDetails',
                    'UserMedias',
                    'VoteThreshold',
                    'Default',
                ],
            ]
        );

        return [
            'project' => $project,
            'currentStep' => $collectStep,
            'props' => $props,
            'proposal' => $proposal,
            'referer' => $refererUri,
        ];
    }
}
