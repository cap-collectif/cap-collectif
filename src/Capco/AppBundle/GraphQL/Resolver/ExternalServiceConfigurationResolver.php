<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\ExternalServiceConfiguration;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ExternalServiceConfigurationRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ExternalServiceConfigurationResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(
        private readonly ExternalServiceConfigurationRepository $repository
    ) {
    }

    public function __invoke(Argument $input): ExternalServiceConfiguration
    {
        return $this->repository->findOneByType($input->offsetGet('type'));
    }
}
