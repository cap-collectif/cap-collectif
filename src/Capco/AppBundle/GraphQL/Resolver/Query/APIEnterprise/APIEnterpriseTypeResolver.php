<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query\APIEnterprise;

use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Error\UserError;
use RuntimeException;

class APIEnterpriseTypeResolver implements ResolverInterface
{
    private $typeResolver;

    public const ENTERPRISE = 'APIEnterpriseEnterprise';
    public const ASSOCIATION = 'APIEnterpriseAssociation';
    public const PUBLIC_ORGA = 'APIEnterprisePublicOrganization';

    public function __construct(TypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    public static function getAPIEnterpriseTypeFromString(string $str): string {
        switch (strtolower($str)){
            case 'une association':
                return self::ASSOCIATION;
            case 'un autre organisme privé':
            case 'une entreprise':
                return self::ENTERPRISE;
            case 'un organisme public':
                return self::PUBLIC_ORGA;
        }
        throw new RuntimeException('Unknown type of API Enterprise');
    }

    public function __invoke(array $data = []): ?Type
    {
        if (!isset($data['type'])){
            throw new UserError('Could not resolve type of APIEnterprise.');
        }
        switch ($data['type']) {
            case self::ENTERPRISE:
            case self::ASSOCIATION:
            case self::PUBLIC_ORGA:
                return $this->typeResolver->resolve($data['type']);
            default:
                throw new UserError('Could not resolve type of APIEnterprise.');
        }
    }
}
