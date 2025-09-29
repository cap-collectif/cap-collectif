<?php

namespace Capco\AppBundle\GraphQL\Resolver\Requirement;

use Capco\AppBundle\DTO\GoogleMapsAddress;
use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ViewerMeetsTheRequirementResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(
        private readonly RequirementViewerValueResolver $resolver
    ) {
    }

    public function __invoke(Requirement $requirement, ?ContributorInterface $contributor = null): bool
    {
        $contributor = $this->preventNullableViewer($contributor);
        $value = $this->resolver->__invoke($requirement, $contributor);

        if (null === $value) {
            return false;
        }

        if (Requirement::DATE_OF_BIRTH === $requirement->getType()) {
            return true;
        }
        if (
            Requirement::POSTAL_ADDRESS === $requirement->getType()
            && $value instanceof GoogleMapsAddress
        ) {
            return true;
        }
        if (\is_string($value)) {
            return true;
        }

        return $value;
    }
}
