<?php
namespace Overblog\GraphQLBundle\__DEFINITIONS__;

use GraphQL\Type\Definition\InputObjectType;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\ConfigProcessor;
use Overblog\GraphQLBundle\Definition\LazyConfig;
use Overblog\GraphQLBundle\Definition\GlobalVariables;
use Overblog\GraphQLBundle\Definition\Type\GeneratedTypeInterface;

/**
 * THIS FILE WAS GENERATED AND SHOULD NOT BE MODIFIED!
 */
final class DistrictInputType extends InputObjectType implements GeneratedTypeInterface
{
    public function __construct(
        ConfigProcessor $configProcessor,
        GlobalVariables $globalVariables = null
    ) {
        $configLoader = function (GlobalVariables $globalVariable) {
            return [
                'name' => 'DistrictInput',
                'description' => null,
                'fields' =>
                    function () use ($globalVariable) {
                        return [
                            'name' => [
                                'type' => Type::nonNull(Type::string()),
                                'description' => null,
                            ],
                            'geojson' => [
                                'type' => $globalVariable->get('typeResolver')->resolve('GeoJSON'),
                                'description' => null,
                            ],
                            'geojsonStyle' => [
                                'type' => $globalVariable->get('typeResolver')->resolve('CssJSON'),
                                'description' => null,
                            ],
                            'displayedOnMap' => [
                                'type' => Type::boolean(),
                                'description' => null,
                                'defaultValue' => false,
                            ],
                        ];
                    },
            ];
        };
        $config = $configProcessor
            ->process(LazyConfig::create($configLoader, $globalVariables))
            ->load();
        parent::__construct($config);
    }
}
