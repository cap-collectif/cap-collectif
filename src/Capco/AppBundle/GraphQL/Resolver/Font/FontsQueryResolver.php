<?php

namespace Capco\AppBundle\GraphQL\Resolver\Font;

use Capco\AppBundle\Repository\FontRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class FontsQueryResolver implements QueryInterface
{
    protected $repository;

    public function __construct(FontRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Argument $args): iterable
    {
        return $this->repository->findAllGroupedByName();
    }
}
