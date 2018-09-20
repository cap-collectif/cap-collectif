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
final class QuestionInputType extends InputObjectType implements GeneratedTypeInterface
{
    const NAME = 'QuestionInput';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'QuestionInput',
            'description' => null,
            'fields' => function () use ($globalVariable) {
                return [
                'id' => [
                    'type' => Type::string(),
                    'description' => 'If null, a new question will be created.',
                ],
                'title' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => null,
                ],
                'type' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('QuestionTypeValue')),
                    'description' => null,
                ],
                'private' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'description' => null,
                    'defaultValue' => false,
                ],
                'required' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'description' => null,
                    'defaultValue' => false,
                ],
                'helpText' => [
                    'type' => Type::string(),
                    'description' => null,
                ],
                'randomQuestionChoices' => [
                    'type' => Type::boolean(),
                    'description' => null,
                ],
                'otherAllowed' => [
                    'type' => Type::boolean(),
                    'description' => null,
                ],
                'validationRule' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('MultipleChoiceQuestionValidationRuleInput'),
                    'description' => null,
                ],
                'questionChoices' => [
                    'type' => Type::listOf($globalVariable->get('typeResolver')->resolve('QuestionChoiceInput')),
                    'description' => null,
                ],
                'description' => [
                    'type' => Type::string(),
                    'description' => null,
                ],
                'jumps' => [
                    'type' => Type::listOf($globalVariable->get('typeResolver')->resolve('LogicJumpInput')),
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
