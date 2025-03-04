<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\SectionRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class CarrouselConfigurationResolver implements QueryInterface
{
    public function __construct(private readonly SectionRepository $sectionRepository)
    {
    }

    public function __invoke(Argument $argument): ?object
    {
        return $this->sectionRepository->findOneBy(['type' => $argument->offsetGet('type')]);
    }
}
