<?php

namespace Capco\AppBundle\GraphQL\Traits;

trait HtmlSanitizationHelperTrait
{
    private function hasOnlyEmptyHtmlTags(string $string): bool
    {
        return 1 === preg_match('/^(\s*<[^>]+>\s*)+$/', $string);
    }
}
