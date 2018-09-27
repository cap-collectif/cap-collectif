<?php
namespace Capco\AppBundle\GraphQL\__GENERATED__;

use GraphQL\Type\Definition\EnumType;
use Overblog\GraphQLBundle\Definition\ConfigProcessor;
use Overblog\GraphQLBundle\Definition\LazyConfig;
use Overblog\GraphQLBundle\Definition\GlobalVariables;
use Overblog\GraphQLBundle\Definition\Type\GeneratedTypeInterface;

/**
 * THIS FILE WAS GENERATED AND SHOULD NOT BE MODIFIED!
 */
final class OrderDirectionType extends EnumType implements GeneratedTypeInterface
{
    const NAME = 'OrderDirection';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'OrderDirection',
            'values' => [
                'ASC' => [
                    'name' => 'ASC',
                    'value' => 'ASC',
                    'deprecationReason' => null,
                    'description' => 'Specifies an ascending order for a given orderBy argument.',
                ],
                'DESC' => [
                    'name' => 'DESC',
                    'value' => 'DESC',
                    'deprecationReason' => null,
                    'description' => 'Specifies a descending order for a given orderBy argument.',
                ],
            ],
            'description' => 'Possible directions in which to order a list of items when provided an orderBy argument.',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
