<?php

namespace Capco\AppBundle\GraphQL\Resolver\Response;

use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Entity\Responses\ValueResponse;

class ResponseValueResolver
{
    public function __invoke(ValueResponse $response): ?string
    {
        $question = $response->getQuestion();
        // Multiple choice question value is encoded in JSON.
        if ($question instanceof MultipleChoiceQuestion) {
            if ('select' === $question->getInputType()) {
                return $response->getValue();
            }
            // encodes characters correctly
            $value = json_encode($response->getValue(), JSON_UNESCAPED_UNICODE);

            return '"null"' !== $value ? $value : null;
        }

        return $response->getValue();
    }
}
