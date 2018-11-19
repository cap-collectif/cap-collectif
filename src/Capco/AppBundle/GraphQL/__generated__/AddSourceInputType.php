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
final class AddSourceInputType extends InputObjectType implements GeneratedTypeInterface
{
    const NAME = 'AddSourceInput';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'AddSourceInput',
            'description' => null,
            'fields' => function () use ($globalVariable) {
                return [
                'sourceableId' => [
                    'type' => Type::nonNull(Type::id()),
                    'description' => 'The Sourceable ID to source.',
                ],
                'body' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'The contents of the source body.',
                ],
                'category' => [
                    'type' => Type::nonNull(Type::id()),
                    'description' => 'The category of the source.',
                ],
                'link' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('URI')),
                    'description' => null,
                ],
                'title' => [
                    'type' => Type::nonNull(Type::string()),
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
