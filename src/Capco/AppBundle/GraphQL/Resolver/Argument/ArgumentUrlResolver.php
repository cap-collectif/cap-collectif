<?php

namespace Capco\AppBundle\GraphQL\Resolver\Argument;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\GraphQL\Resolver\Opinion\OpinionUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\OpinionVersion\OpinionVersionUrlResolver;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ArgumentUrlResolver implements QueryInterface
{
    public function __construct(
        private readonly OpinionUrlResolver $opinionUrlResolver,
        private readonly OpinionVersionUrlResolver $opinionVersionUrlResolver
    ) {
    }

    public function __invoke(Argument $argument): string
    {
        $parent = $argument->getParent();
        if ($parent instanceof Opinion) {
            return $this->opinionUrlResolver->__invoke($parent) . '#arg-' . $argument->getId();
        }
        if ($parent instanceof OpinionVersion) {
            return $this->opinionVersionUrlResolver->__invoke($parent) .
                '#arg-' .
                $argument->getId();
        }

        return '';
    }
}
