<?php

namespace Capco\AppBundle\GraphQL\Resolver\District;

use Capco\AppBundle\Entity\District\AbstractDistrict;
use Capco\AppBundle\Entity\District\GlobalDistrict;
use Capco\AppBundle\Entity\District\ProposalDistrict;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;

class DistrictTypeResolver implements QueryInterface
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
            if (\in_array($currentSchemaName, ['internal', 'dev'])) {
                return $this->typeResolver->resolve('InternalProposalDistrict');
            }
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewProposalDistrict');
            }
        }
        if ($district instanceof GlobalDistrict) {
            if (\in_array($currentSchemaName, ['internal', 'dev'])) {
                return $this->typeResolver->resolve('InternalGlobalDistrict');
            }
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewGlobalDistrict');
            }
        }

        throw new UserError('Could not resolve type of District.');
    }
}
