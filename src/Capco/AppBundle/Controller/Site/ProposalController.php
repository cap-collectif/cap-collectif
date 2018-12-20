<?php
namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Resolver\UrlResolver;
use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use JMS\Serializer\SerializationContext;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
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
     * @ParamConverter("project", options={"mapping": {"projectSlug": "slug"}})
     * @ParamConverter("currentStep", options={"mapping": {"stepSlug": "slug"}})
     * @ParamConverter("proposal", options={"mapping": {"proposalSlug": "slug"}})
     * @Template("CapcoAppBundle:Proposal:show.html.twig")
     * @Cache(smaxage="60", public=true)
     */
    public function showProposalAction(
        Request $request,
        Project $project,
        CollectStep $currentStep,
        Proposal $proposal
    ) {
        if ($proposal->isDraft() && $proposal->getAuthor() !== $this->getUser()) {
            throw new NotFoundHttpException(
                sprintf(
                    'The proposal `%s` is in draft state and current user is not the creator.',
                    $proposal->getId()
                )
            );
        }

        if (!$proposal->canDisplay($this->getUser())) {
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
                : $urlResolver->getStepUrl($currentStep, UrlGeneratorInterface::ABSOLUTE_URL);

        $proposalForm = $currentStep->getProposalForm();
        $votableStep = $this->get(
            'capco\appbundle\graphql\resolver\proposal\proposalcurrentvotablestepresolver'
        )->__invoke($proposal);
        $props = $serializer->serialize(
            [
                'proposalId' => $proposal->getId(),
                'currentVotableStepId' => $votableStep ? $votableStep->getId() : null,
                'form' => $proposalForm,
                'categories' => $proposalForm ? $proposalForm->getCategories() : [],
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
        return $this->render('CapcoAppBundle:Proposal:show.html.twig', [
            'project' => $project,
            'currentStep' => $currentStep,
            'props' => $props,
            'proposal' => $proposal,
            'referer' => $refererUri,
        ]);
    }
}
