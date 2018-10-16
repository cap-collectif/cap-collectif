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
final class ArgumentValueType extends EnumType implements GeneratedTypeInterface
{
    const NAME = 'ArgumentValue';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'ArgumentValue',
            'values' => [
                'AGAINST' => [
                    'name' => 'AGAINST',
                    'value' => 0,
                    'deprecationReason' => null,
                    'description' => 'AGAINST argument',
                ],
                'FOR' => [
                    'name' => 'FOR',
                    'value' => 1,
                    'deprecationReason' => null,
                    'description' => 'FOR argument',
                ],
            ],
            'description' => 'Value of an argument',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
