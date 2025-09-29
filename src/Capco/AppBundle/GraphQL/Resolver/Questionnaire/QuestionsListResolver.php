<?php

namespace Capco\AppBundle\GraphQL\Resolver\Questionnaire;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Enum\QuestionsFilterType;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QuestionsListResolver implements QueryInterface
{
    public function __construct(
        private readonly AbstractQuestionRepository $repository
    ) {
    }

    public function __invoke(Questionnaire $questionnaire, Argument $args): iterable
    {
        $filter = $args->offsetGet('filter');

        return match ($filter) {
            QuestionsFilterType::JUMPS_ONLY => $this->repository->findWithJumpsOrWithAlwaysJumpDestinationByQuestionnaire($questionnaire),
            default => $this->repository->findByQuestionnaire($questionnaire),
        };
    }
}
