<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResponsesResolverTrait;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalViewerIsAnEvaluerResolver;

class ProposalResponsesResolver implements ResolverInterface
{
    use ResponsesResolverTrait;

    private $proposalViewerIsAnEvaluerResolver;

    public function __construct(
        AbstractQuestionRepository $repository,
        AbstractResponseRepository $abstractResponseRepository,
        ProposalViewerIsAnEvaluerResolver $proposalViewerIsAnEvaluerResolver
    ) {
        $this->abstractQuestionRepository = $repository;
        $this->abstractResponseRepository = $abstractResponseRepository;
        $this->proposalViewerIsAnEvaluerResolver = $proposalViewerIsAnEvaluerResolver;
    }

    public function __invoke(Proposal $proposal, $viewer, \ArrayObject $context): iterable
    {
        $viewerIsEvaluer = $this->proposalViewerIsAnEvaluerResolver->__invoke($proposal, $viewer);

        $responses = $this->filterVisibleResponses(
            $this->getResponsesForProposal($proposal),
            $proposal->getAuthor(),
            $viewer,
            $context,
            $viewerIsEvaluer 
        );
        $iterator = $responses->getIterator();

        $iterator->uasort(function ($a, $b) {
            return $a->getQuestion()->getPosition() - $b->getQuestion()->getPosition();
        });

        return $iterator;
    }
}
