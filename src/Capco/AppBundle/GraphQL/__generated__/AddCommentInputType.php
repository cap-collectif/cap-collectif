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
final class AddCommentInputType extends InputObjectType implements GeneratedTypeInterface
{
    const NAME = 'AddCommentInput';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'AddCommentInput',
            'description' => null,
            'fields' => function () use ($globalVariable) {
                return [
                'commentableId' => [
                    'type' => Type::nonNull(Type::id()),
                    'description' => 'The Commentable ID of the subject to comment.',
                ],
                'body' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'The contents of the comment.',
                ],
                'authorName' => [
                    'type' => Type::string(),
                    'description' => null,
                ],
                'authorEmail' => [
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
