<?php

namespace Capco\AppBundle\GraphQL\Resolver\Type;

use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Utils\Text;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class FormattedValueResponseTypeResolver implements ResolverInterface
{
    public function __invoke(ValueResponse $response): ?string
    {
        if (!$response->getValue()) {
            return null;
        }
        if (\is_string($response->getValue())) {
            return Text::htmlToString($response->getValue());
        }

        $value = $response->getValue();
        $filtered = array_filter(
            array_merge($value['labels'] ?? [], [$value['other'] ?? []]),
            function ($label) {
                return $label;
            }
        );
        $labels = array_map(function ($label) {
            return Text::htmlToString($label);
        }, $filtered);

        return implode(', ', $labels);
    }
}
