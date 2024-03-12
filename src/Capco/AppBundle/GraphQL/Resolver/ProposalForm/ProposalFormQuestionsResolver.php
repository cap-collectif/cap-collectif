<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Enum\QuestionsFilterType;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProposalFormQuestionsResolver implements QueryInterface
{
    private AbstractQuestionRepository $repository;

    public function __construct(AbstractQuestionRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(ProposalForm $form, Argument $args): iterable
    {
        $filter = $args->offsetGet('filter');

        switch ($filter) {
            case QuestionsFilterType::JUMPS_ONLY:
                return $this->repository->findWithJumpsOrWithAlwaysJumpDestinationByForm($form);

            default:
                return $this->repository->findByProposalForm($form);
        }
    }
}
