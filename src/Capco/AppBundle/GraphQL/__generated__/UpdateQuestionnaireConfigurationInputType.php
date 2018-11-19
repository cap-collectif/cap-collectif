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
final class UpdateQuestionnaireConfigurationInputType extends InputObjectType implements GeneratedTypeInterface
{
    const NAME = 'UpdateQuestionnaireConfigurationInput';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'UpdateQuestionnaireConfigurationInput',
            'description' => null,
            'fields' => function () use ($globalVariable) {
                return [
                'questionnaireId' => [
                    'type' => Type::nonNull(Type::id()),
                    'description' => null,
                ],
                'title' => [
                    'type' => Type::string(),
                    'description' => null,
                ],
                'description' => [
                    'type' => Type::string(),
                    'description' => null,
                ],
                'questions' => [
                    'type' => Type::listOf(Type::nonNull($globalVariable->get('typeResolver')->resolve('QuestionnaireAbstractQuestionInput'))),
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
