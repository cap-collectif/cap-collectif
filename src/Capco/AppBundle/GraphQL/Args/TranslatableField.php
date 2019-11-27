<?php

namespace Capco\AppBundle\GraphQL\Args;

use Overblog\GraphQLBundle\Definition\Builder\MappingInterface;

class TranslatableField implements MappingInterface
{
    public function toMappingDefinition(array $config): array
    {
        return [
            'locale' => [
                'type' => 'TranslationLocale',
                'description' => 'The locale to translate content (eg: fr-FR).'
            ]
        ];
    }
}
