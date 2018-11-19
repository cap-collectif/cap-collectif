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
final class QuestionChoiceInputType extends InputObjectType implements GeneratedTypeInterface
{
    const NAME = 'QuestionChoiceInput';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'QuestionChoiceInput',
            'description' => 'A possible choice of a question',
            'fields' => function () use ($globalVariable) {
                return [
                'id' => [
                    'type' => Type::id(),
                    'description' => null,
                ],
                'title' => [
                    'type' => Type::nonNull(Type::string()),
                    'description' => null,
                ],
                'description' => [
                    'type' => Type::string(),
                    'description' => null,
                ],
                'color' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('QuestionChoiceColor'),
                    'description' => null,
                ],
                'image' => [
                    'type' => Type::id(),
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
