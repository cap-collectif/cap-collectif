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

    public function resolveValue(ValueResponse $response)// : ?string
    {
        // Multiple choice question value is encoded in JSON.
        if ($response->getQuestion() instanceof MultipleChoiceQuestion) {
            if (!$response->getValue()) {
                return null;
            }

            return json_encode($response->getValue(), JSON_UNESCAPED_UNICODE); // encodes characters correctly
        }

        return $response->getValue();
    }
}
