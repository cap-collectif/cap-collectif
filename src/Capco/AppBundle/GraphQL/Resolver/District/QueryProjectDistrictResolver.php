<?php

namespace Capco\AppBundle\GraphQL\Resolver\District;

use Capco\AppBundle\Repository\ProjectDistrictRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QueryProjectDistrictResolver implements ResolverInterface
{
    protected $projectDistrictRepository;

    public function __construct(ProjectDistrictRepository $projectDistrictRepository)
    {
        $this->projectDistrictRepository = $projectDistrictRepository;
    }

    public function __invoke(): array
    {
        return $this->projectDistrictRepository->findBy([], ['name' => 'ASC']);
    }
}
