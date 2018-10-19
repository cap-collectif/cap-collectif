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
final class CategoryOrderFieldType extends EnumType implements GeneratedTypeInterface
{
    const NAME = 'CategoryOrderField';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'CategoryOrderField',
            'values' => [
                'ALPHABETICAL' => [
                    'name' => 'ALPHABETICAL',
                    'value' => 'ALPHABETICAL',
                    'deprecationReason' => null,
                    'description' => null,
                ],
            ],
            'description' => 'Ordering options for categories.',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
