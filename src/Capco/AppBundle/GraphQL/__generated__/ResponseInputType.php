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
final class ResponseInputType extends InputObjectType implements GeneratedTypeInterface
{
    const NAME = 'ResponseInput';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'ResponseInput',
            'description' => 'A response',
            'fields' => function () use ($globalVariable) {
                return [
                'value' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('JSON'),
                    'description' => 'If related to a value question',
                ],
                'question' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'The question id',
                ],
                'medias' => [
                    'type' => Type::listOf(Type::nonNull(Type::id())),
                    'description' => 'If related to a media question',
                ],
            ];
            },
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
