<?php

namespace Capco\AppBundle\GraphQL\Resolver\District;

use Capco\AppBundle\Entity\District\ProjectDistrict;
use Capco\AppBundle\Entity\District\AbstractDistrict;
use Capco\AppBundle\Entity\District\ProposalDistrict;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Resolver\TypeResolver;

class DistrictTypeResolver implements ResolverInterface
{
    private $typeResolver;

    public function __construct(TypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    public function __invoke(AbstractDistrict $district): Type
    {
        if ($district instanceof ProposalDistrict) {
            return $this->typeResolver->resolve('ProposalDistrict');
        }
        if ($district instanceof ProjectDistrict) {
            return $this->typeResolver->resolve('ProjectDistrict');
        }

        throw new UserError('Could not resolve type of District.');
    }
}
