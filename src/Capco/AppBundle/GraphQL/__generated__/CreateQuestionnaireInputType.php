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
final class CreateQuestionnaireInputType extends InputObjectType implements GeneratedTypeInterface
{
    const NAME = 'CreateQuestionnaireInput';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'CreateQuestionnaireInput',
            'description' => null,
            'fields' => function () use ($globalVariable) {
                return [
                'title' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => 'The questionnaire form title',
                ],
                'type' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('QuestionnaireType')),
                    'description' => 'The questionnaire type',
                    'defaultValue' => 'QUESTIONNAIRE',
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
