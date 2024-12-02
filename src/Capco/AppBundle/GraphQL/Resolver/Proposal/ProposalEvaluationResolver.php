<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\ProposalEvaluation;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResponsesResolverTrait;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Capco\AppBundle\Security\ProposalAnalysisRelatedVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\Collection;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

/**
 * @deprecated this is our legacy evaluation tool
 */
class ProposalEvaluationResolver implements QueryInterface
{
    use ResponsesResolverTrait;
    private $analysisRelatedVoter;

    public function __construct(
        private ProposalViewerIsAnEvaluerResolver $isViewerAnEvaluerResolver,
        AbstractQuestionRepository $abstractQuestionRepository,
        AbstractResponseRepository $abstractResponseRepository,
        private readonly AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->abstractQuestionRepository = $abstractQuestionRepository;
        $this->abstractResponseRepository = $abstractResponseRepository;
    }

    public function __invoke(
        ProposalEvaluation $evaluation,
        $viewer,
        \ArrayObject $context
    ): Collection {
        $isLegacyAnalyst = $this->isViewerAnEvaluerResolver->__invoke(
            $evaluation->getProposal(),
            $viewer
        );

        $isAnalyst = false;
        if ($viewer instanceof User) {
            $isAnalyst = $this->authorizationChecker->isGranted(
                [ProposalAnalysisRelatedVoter::VIEW],
                $evaluation->getProposal()
            );
        }

        $viewerCanSeePrivateResponses =
            $isLegacyAnalyst
            || $isAnalyst
            || ($viewer instanceof User && $viewer->isAdmin())
            || ($context->offsetExists('disable_acl') && true === $context->offsetGet('disable_acl'));

        return $this->getResponsesForEvaluation($evaluation)->filter(function ($response) use (
            $viewerCanSeePrivateResponses
        ) {
            return !$response->getQuestion()->isPrivate() || $viewerCanSeePrivateResponses;
        });
    }
}
