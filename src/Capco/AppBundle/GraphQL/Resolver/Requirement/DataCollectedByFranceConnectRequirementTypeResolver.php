<?php

namespace Capco\AppBundle\GraphQL\Resolver\Requirement;

use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;

class DataCollectedByFranceConnectRequirementTypeResolver implements QueryInterface
{
    public function __construct(private readonly TypeResolver $typeResolver)
    {
    }

    public function __invoke(Requirement $requirement): Type
    {
        if (Requirement::FIRSTNAME === $requirement->getType()) {
            return $this->typeResolver->resolve('FirstnameRequirement');
        }
        if (Requirement::LASTNAME === $requirement->getType()) {
            return $this->typeResolver->resolve('LastnameRequirement');
        }
        if (Requirement::DATE_OF_BIRTH === $requirement->getType()) {
            return $this->typeResolver->resolve('DateOfBirthRequirement');
        }

        throw new UserError('Could not resolve type of DataCollectedByFranceConnectRequirement.');
    }
}
