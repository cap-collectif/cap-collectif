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
final class AddReplyInputType extends InputObjectType implements GeneratedTypeInterface
{
    const NAME = 'AddReplyInput';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'AddReplyInput',
            'description' => null,
            'fields' => function () use ($globalVariable) {
                return [
                'questionnaireId' => [
                    'type' => Type::nonNull(Type::id()),
                    'description' => 'The id of the questionnaire',
                ],
                'responses' => [
                    'type' => Type::listOf($globalVariable->get('typeResolver')->resolve('ResponseInput')),
                    'description' => 'The responses to the questionnaire questions',
                ],
                'private' => [
                    'type' => Type::boolean(),
                    'description' => 'Anonymous or not.',
                ],
                'draft' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'description' => 'If true will create a draft reply.',
                    'defaultValue' => false,
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
