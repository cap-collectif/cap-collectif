<?php

namespace Capco\AppBundle\GraphQL\Resolver\Consultation;

use Capco\AppBundle\Entity\OpinionTypeAppendixType;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class SectionAppendixIdResolver implements ResolverInterface
{
    public function __invoke(OpinionTypeAppendixType $type)
    {
        return $type->getAppendixTypeId();
    }
}
