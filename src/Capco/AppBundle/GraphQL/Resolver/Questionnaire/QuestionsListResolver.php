<?php

namespace Capco\AppBundle\GraphQL\Resolver\Questionnaire;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Enum\QuestionsFilterType;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QuestionsListResolver implements ResolverInterface
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
                return $this->repository->findWithJumpsOrWithAlwaysJumpDestination($questionnaire);

            default:
                return $this->repository->findByQuestionnaire($questionnaire);
        }
    }
}
