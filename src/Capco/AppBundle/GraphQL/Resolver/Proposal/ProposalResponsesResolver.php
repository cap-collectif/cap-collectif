<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResponsesResolverTrait;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Capco\AppBundle\Security\ProposalAnalysisRelatedVoter;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class ProposalResponsesResolver implements QueryInterface
{
    use ResponsesResolverTrait;
    private $analystRepository;
    private $analysisRelatedVoter;

    public function __construct(
        AbstractQuestionRepository $repository,
        AbstractResponseRepository $abstractResponseRepository,
        private ProposalViewerIsAnEvaluerResolver $proposalViewerIsAnEvaluerResolver,
        private readonly AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->abstractQuestionRepository = $repository;
        $this->abstractResponseRepository = $abstractResponseRepository;
    }

    public function __invoke(Proposal $proposal, $viewer, \ArrayObject $context): array
    {
        $isLegacyAnalyst = $this->proposalViewerIsAnEvaluerResolver->__invoke($proposal, $viewer);
        $isAnalyst = false;
        if ($viewer instanceof User) {
            $isAnalyst = $this->authorizationChecker->isGranted(
                [ProposalAnalysisRelatedVoter::VIEW],
                $proposal
            );
        }

        $responses = $this->filterVisibleResponses(
            $this->getResponsesForProposal($proposal),
            $proposal->getAuthor(),
            $viewer,
            $context,
            $isLegacyAnalyst,
            $isAnalyst
        );

        $iterator = $responses->getIterator();
        $responsesArray = iterator_to_array($iterator);

        usort($responsesArray, function ($a, $b) {
            return $a->getQuestion()->getPosition() - $b->getQuestion()->getPosition();
        });

        return $responsesArray;
    }
}
