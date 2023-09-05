<?php

namespace Capco\AppBundle\GraphQL\Resolver\District;

use Capco\AppBundle\Entity\District\AbstractDistrict;
use Capco\AppBundle\Entity\District\ProjectDistrict;
use Capco\AppBundle\Entity\District\ProposalDistrict;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Error\UserError;

class DistrictTypeResolver implements ResolverInterface
{
    private TypeResolver $typeResolver;

    public function __construct(TypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    public function __invoke(AbstractDistrict $district): Type
    {
        $currentSchemaName = $this->typeResolver->getCurrentSchemaName();

        if ($district instanceof ProposalDistrict) {
            if ('internal' === $currentSchemaName) {
                return $this->typeResolver->resolve('InternalProposalDistrict');
            }
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewProposalDistrict');
            }
        }
        if ($district instanceof ProjectDistrict) {
            if ('internal' === $currentSchemaName) {
                return $this->typeResolver->resolve('InternalProjectDistrict');
            }
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewProjectDistrict');
            }
        }

        throw new UserError('Could not resolve type of District.');
    }
}
