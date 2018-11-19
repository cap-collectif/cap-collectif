<?php
namespace Capco\AppBundle\GraphQL\__GENERATED__;

use Overblog\GraphQLBundle\Definition\Type\CustomScalarType;
use Overblog\GraphQLBundle\Definition\ConfigProcessor;
use Overblog\GraphQLBundle\Definition\LazyConfig;
use Overblog\GraphQLBundle\Definition\GlobalVariables;
use Overblog\GraphQLBundle\Definition\Type\GeneratedTypeInterface;

/**
 * THIS FILE WAS GENERATED AND SHOULD NOT BE MODIFIED!
 */
final class DateTimeType extends CustomScalarType implements GeneratedTypeInterface
{
    const NAME = 'DateTime';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'DateTime',
            'description' => 'A string containing a datetime.',
            'scalarType' => null,
            'serialize' => function () use ($globalVariable) {
                return call_user_func_array(['Capco\\AppBundle\\GraphQL\\Type\\DateTimeType', 'serialize'], func_get_args());
            },
            'parseValue' => function () use ($globalVariable) {
                return call_user_func_array(['Capco\\AppBundle\\GraphQL\\Type\\DateTimeType', 'parseValue'], func_get_args());
            },
            'parseLiteral' => function () use ($globalVariable) {
                return call_user_func_array(['Capco\\AppBundle\\GraphQL\\Type\\DateTimeType', 'parseLiteral'], func_get_args());
            },
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
