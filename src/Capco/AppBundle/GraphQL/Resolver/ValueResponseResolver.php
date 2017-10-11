<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use GraphQL\Language\AST\Value;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class ValueResponseResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function resolveValue(ValueResponse $response): string
    {
        // Use this condition because value type of string and Relay return array on multiple choice question value.
        if ($response->getQuestion() instanceof MultipleChoiceQuestion) {
            return json_encode($response->getValue());
        }

        return $response->getValue();
    }
}
