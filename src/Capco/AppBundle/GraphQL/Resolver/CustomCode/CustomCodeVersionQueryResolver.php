<?php

namespace Capco\AppBundle\GraphQL\Resolver\CustomCode;

use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Service\CustomCodeVersioningService;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class CustomCodeVersionQueryResolver implements QueryInterface
{
    public function __construct(private readonly CustomCodeVersioningService $customCodeVersioning)
    {
    }

    /**
     * @return null|array<string, mixed>
     */
    public function __invoke(Argument $argument): ?array
    {
        return $this->customCodeVersioning->getVersion(
            GlobalIdResolver::getDecodedId($argument->offsetGet('id'), true)
        );
    }
}
