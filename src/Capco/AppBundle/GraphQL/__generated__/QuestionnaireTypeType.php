<?php
namespace Capco\AppBundle\GraphQL\__GENERATED__;

use GraphQL\Type\Definition\EnumType;
use Overblog\GraphQLBundle\Definition\ConfigProcessor;
use Overblog\GraphQLBundle\Definition\LazyConfig;
use Overblog\GraphQLBundle\Definition\GlobalVariables;
use Overblog\GraphQLBundle\Definition\Type\GeneratedTypeInterface;

/**
 * THIS FILE WAS GENERATED AND SHOULD NOT BE MODIFIED!
 */
final class QuestionnaireTypeType extends EnumType implements GeneratedTypeInterface
{
    const NAME = 'QuestionnaireType';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'QuestionnaireType',
            'values' => [
                'QUESTIONNAIRE' => [
                    'name' => 'QUESTIONNAIRE',
                    'value' => \constant("Capco\\AppBundle\\Enum\\QuestionnaireType::QUESTIONNAIRE"),
                    'deprecationReason' => null,
                    'description' => 'Draft are allowed.',
                ],
                'VOTING' => [
                    'name' => 'VOTING',
                    'value' => \constant("Capco\\AppBundle\\Enum\\QuestionnaireType::VOTING"),
                    'deprecationReason' => null,
                    'description' => 'Draft are not allowed.',
                ],
            ],
            'description' => 'Available questionnaire types.',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
