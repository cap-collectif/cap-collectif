<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QuestionQueryResolver implements ResolverInterface
{
    private $abstractQuestionRepository;

    public function __construct(AbstractQuestionRepository $abstractQuestionRepository)
    {
        $this->abstractQuestionRepository = $abstractQuestionRepository;
    }

    public function __invoke(Argument $args): AbstractQuestion
    {
        return $this->abstractQuestionRepository->find($args['id']);
    }
}
