<?php

namespace Capco\AppBundle\GraphQL\Resolver\Questionnaire;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Enum\QuestionsFilterType;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QuestionsListResolver implements QueryInterface
{
    private AbstractQuestionRepository $repository;

    public function __construct(AbstractQuestionRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Questionnaire $questionnaire, Argument $args): iterable
    {
        $filter = $args->offsetGet('filter');

        switch ($filter) {
            case QuestionsFilterType::JUMPS_ONLY:
                return $this->repository->findWithJumpsOrWithAlwaysJumpDestinationByQuestionnaire($questionnaire);

            default:
                return $this->repository->findByQuestionnaire($questionnaire);
        }
    }
}
