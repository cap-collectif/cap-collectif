<?php

namespace Capco\AppBundle\GraphQL\Resolver\Section;

use Capco\AppBundle\Entity\OpinionTypeAppendixType;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class SectionAppendixHelpTextResolver implements ResolverInterface
{
    public function __invoke(OpinionTypeAppendixType $type)
    {
        return $type->getAppendixTypeHelpText();
    }
}
