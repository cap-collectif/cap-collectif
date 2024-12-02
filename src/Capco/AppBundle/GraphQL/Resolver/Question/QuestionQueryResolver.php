<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QuestionQueryResolver implements QueryInterface
{
    public function __construct(private readonly AbstractQuestionRepository $abstractQuestionRepository)
    {
    }

    public function __invoke(Argument $args): AbstractQuestion
    {
        return $this->abstractQuestionRepository->find($args['id']);
    }
}
