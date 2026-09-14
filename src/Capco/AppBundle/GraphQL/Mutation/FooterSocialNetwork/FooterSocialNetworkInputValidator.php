<?php

namespace Capco\AppBundle\GraphQL\Mutation\FooterSocialNetwork;

use Capco\AppBundle\Enum\FooterSocialNetworkErrorCode;
use Overblog\GraphQLBundle\Definition\Argument;

final class FooterSocialNetworkInputValidator
{
    private const MAX_TITLE_LENGTH = 255;
    private const MAX_LINK_LENGTH = 255;
    private const MAX_STYLE_LENGTH = 20;

    public static function getErrorCode(Argument $input): ?string
    {
        foreach ([
            'title' => self::MAX_TITLE_LENGTH,
            'link' => self::MAX_LINK_LENGTH,
            'style' => self::MAX_STYLE_LENGTH,
        ] as $field => $maxLength) {
            $value = $input->offsetGet($field);
            if (null !== $value && mb_strlen((string) $value) > $maxLength) {
                return FooterSocialNetworkErrorCode::VALUE_TOO_LONG;
            }
        }

        return null;
    }
}
