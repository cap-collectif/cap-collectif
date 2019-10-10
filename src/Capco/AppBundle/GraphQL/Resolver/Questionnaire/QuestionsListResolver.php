<?php

namespace Capco\AppBundle\GraphQL\Resolver\Questionnaire;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QuestionsListResolver implements ResolverInterface
{
    private $repository;

    public function __construct(AbstractQuestionRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Questionnaire $questionnaire): iterable
    {
        return $this->repository->findByQuestionnaire($questionnaire);
    }
}
