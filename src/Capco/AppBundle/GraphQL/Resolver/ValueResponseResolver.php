<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Entity\Responses\ValueResponse;

class ValueResponseResolver
{
    public function resolveValue(ValueResponse $response)//: ?string
    {
        // Multiple choice question value is encoded in JSON.
        if ($response->getQuestion() instanceof MultipleChoiceQuestion) {
            // encodes characters correctly
            return json_encode($response->getValue(), JSON_UNESCAPED_UNICODE);
        }

        return $response->getValue();
    }
}
