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
final class CommentOrderType extends InputObjectType implements GeneratedTypeInterface
{
    const NAME = 'CommentOrder';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'CommentOrder',
            'description' => 'Ways in which lists of comments can be ordered upon return.',
            'fields' => function () use ($globalVariable) {
                return [
                'field' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('CommentOrderField')),
                    'description' => null,
                    'defaultValue' => 'PUBLISHED_AT',
                ],
                'direction' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('OrderDirection')),
                    'description' => null,
                    'defaultValue' => 'DESC',
                ],
            ];
            },
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
