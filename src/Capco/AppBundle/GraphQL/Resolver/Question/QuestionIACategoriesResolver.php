<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Repository\ValueResponseRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QuestionIACategoriesResolver implements QueryInterface
{
    public function __construct(private readonly ValueResponseRepository $repository)
    {
    }

    public function __invoke(AbstractQuestion $question, Argument $argument, User $viewer): array
    {
        return $this->repository->countCategories($question, $argument->offsetGet('limit'));
    }
}
