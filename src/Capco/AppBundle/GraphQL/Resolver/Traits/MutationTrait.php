<?php

namespace Capco\AppBundle\GraphQL\Resolver\Traits;

use Overblog\GraphQLBundle\Definition\Argument;

trait MutationTrait
{
    private function formatInput(Argument $input): void
    {
        $inputFormatted = $input->offsetGet('input');
        $input->exchangeArray($inputFormatted);
    }
}
