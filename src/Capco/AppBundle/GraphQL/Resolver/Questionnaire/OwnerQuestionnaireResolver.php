<?php

namespace Capco\AppBundle\GraphQL\Resolver\Questionnaire;

use Capco\AppBundle\Entity\Interfaces\Owner;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class OwnerQuestionnaireResolver implements QueryInterface
{
    public function __construct(
        private readonly QuestionnaireRepository $repository
    ) {
    }

    public function __invoke(Owner $owner, Argument $args): ConnectionInterface
    {
        $query = $args->offsetGet('query');
        $availableOnly = $args->offsetGet('availableOnly');

        $options = [
            'query' => $query,
            'availableOnly' => $availableOnly,
        ];

        $paginator = new Paginator(
            fn (int $offset, int $limit) => $this->repository->getByOwner($owner, $offset, $limit, $options)
        );

        return $paginator->auto($args, $this->repository->countByOwner($owner, $options));
    }
}
