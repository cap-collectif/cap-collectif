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
final class URIType extends CustomScalarType implements GeneratedTypeInterface
{
    const NAME = 'URI';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'URI',
            'description' => 'An RFC 3986, RFC 3987, and RFC 6570 (level 4) compliant URI string.',
            'scalarType' => null,
            'serialize' => function () use ($globalVariable) {
                return call_user_func_array(['Capco\\AppBundle\\GraphQL\\Type\\URIType', 'serialize'], func_get_args());
            },
            'parseValue' => function () use ($globalVariable) {
                return call_user_func_array(['Capco\\AppBundle\\GraphQL\\Type\\URIType', 'parseValue'], func_get_args());
            },
            'parseLiteral' => function () use ($globalVariable) {
                return call_user_func_array(['Capco\\AppBundle\\GraphQL\\Type\\URIType', 'parseLiteral'], func_get_args());
            },
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
