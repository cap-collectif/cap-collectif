<?php

namespace Capco\AppBundle\GraphQL\Resolver\Requirement;

use Capco\AppBundle\DTO\GoogleMapsAddress;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Entity\Requirement;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ViewerMeetsTheRequirementResolver implements ResolverInterface
{
    use ResolverTrait;

    private RequirementViewerValueResolver $resolver;

    public function __construct(RequirementViewerValueResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function __invoke(Requirement $requirement, $viewer): bool
    {
        $viewer = $this->preventNullableViewer($viewer);
        $value = $this->resolver->__invoke($requirement, $viewer);
        if (null === $value) {
            return false;
        }

        if (Requirement::DATE_OF_BIRTH === $requirement->getType()) {
            return true;
        }
        if (
            Requirement::POSTAL_ADDRESS === $requirement->getType() &&
            $value instanceof GoogleMapsAddress
        ) {
            return true;
        }
        if (\is_string($value)) {
            return true;
        }

        return $value;
    }
}
