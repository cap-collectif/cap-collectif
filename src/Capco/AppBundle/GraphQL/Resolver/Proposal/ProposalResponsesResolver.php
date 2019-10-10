<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResponsesResolverTrait;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalResponsesResolver implements ResolverInterface
{
    use ResponsesResolverTrait;

    public function __construct(
        AbstractQuestionRepository $repository,
        AbstractResponseRepository $abstractResponseRepository
    ) {
        $this->abstractQuestionRepository = $repository;
        $this->abstractResponseRepository = $abstractResponseRepository;
    }

    public function __invoke(Proposal $proposal, $viewer, \ArrayObject $context): iterable
    {
        $responses = $this->filterVisibleResponses(
            $this->getResponsesForProposal($proposal),
            $proposal->getAuthor(),
            $viewer,
            $context
        );
        $iterator = $responses->getIterator();

        $iterator->uasort(function ($a, $b) {
            return $a->getQuestion()->getPosition() - $b->getQuestion()->getPosition();
        });

        return $iterator;
    }
}
