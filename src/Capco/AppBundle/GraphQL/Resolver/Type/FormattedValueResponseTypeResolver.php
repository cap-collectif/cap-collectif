<?php

namespace Capco\AppBundle\GraphQL\Resolver\Type;

use Capco\AppBundle\Entity\Responses\ValueResponse;

class FormattedValueResponseTypeResolver
{
    public function __invoke(ValueResponse $response): ?string
    {
        if (!$response->getValue()) {
            return null;
        }
        if (\is_string($response->getValue())) {
            return $response->getValue();
        }

        $value = $response->getValue();
        $labels = array_filter(array_merge($value['labels'], [$value['others'] ?? []]), function ($label) {
            return $label;
        });

        return implode(', ', $labels);
    }
}
