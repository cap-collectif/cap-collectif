<?php
namespace Capco\AppBundle\GraphQL\__GENERATED__;

use GraphQL\Type\Definition\InputObjectType;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\ConfigProcessor;
use Overblog\GraphQLBundle\Definition\LazyConfig;
use Overblog\GraphQLBundle\Definition\GlobalVariables;
use Overblog\GraphQLBundle\Definition\Type\GeneratedTypeInterface;

/**
 * THIS FILE WAS GENERATED AND SHOULD NOT BE MODIFIED!
 */
final class ChangeDistrictInputType extends InputObjectType implements GeneratedTypeInterface
{
    const NAME = 'ChangeDistrictInput';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'ChangeDistrictInput',
            'description' => null,
            'fields' => function () use ($globalVariable) {
                return [
                'districtId' => [
                    'type' => Type::nonNull(Type::id()),
                    'description' => 'The district id',
                ],
                'geojson' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('GeoJSON'),
                    'description' => null,
                ],
                'displayedOnMap' => [
                    'type' => Type::boolean(),
                    'description' => null,
                ],
                'name' => [
                    'type' => Type::string(),
                    'description' => null,
                ],
                'clientMutationId' => [
                    'type' => Type::string(),
                    'description' => null,
                ],
            ];
            },
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
