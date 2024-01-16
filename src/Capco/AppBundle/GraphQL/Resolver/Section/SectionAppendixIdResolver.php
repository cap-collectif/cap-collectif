<?php

namespace Capco\AppBundle\GraphQL\Resolver\Section;

use Capco\AppBundle\Entity\OpinionTypeAppendixType;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class SectionAppendixIdResolver implements QueryInterface
{
    public function __invoke(OpinionTypeAppendixType $type): ?string
    {
        return $type->getAppendixTypeId();
    }
}
