<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Responses\ValueResponse;

class FormattedValueResponseResolver
{
    public function __invoke(ValueResponse $response)
    {
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
