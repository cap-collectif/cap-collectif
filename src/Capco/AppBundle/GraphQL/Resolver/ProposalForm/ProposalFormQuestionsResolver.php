<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Enum\QuestionsFilterType;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProposalFormQuestionsResolver implements QueryInterface
{
    public function __construct(
        private readonly AbstractQuestionRepository $repository
    ) {
    }

    public function __invoke(ProposalForm $form, Argument $args): iterable
    {
        $filter = $args->offsetGet('filter');

        return match ($filter) {
            QuestionsFilterType::JUMPS_ONLY => $this->repository->findWithJumpsOrWithAlwaysJumpDestinationByForm($form),
            default => $this->repository->findByProposalForm($form),
        };
    }
}
