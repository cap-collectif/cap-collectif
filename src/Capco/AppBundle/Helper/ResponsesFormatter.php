<?php

namespace Capco\AppBundle\Helper;

use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Repository\AbstractQuestionRepository;

class ResponsesFormatter
{
    protected $questionRepo;

    public function __construct(AbstractQuestionRepository $questionRepo)
    {
        $this->questionRepo = $questionRepo;
    }

    public function format(array $responses): array
    {
        // we need to set _type for polycollection
        // and position for reordering
        foreach ($responses as &$response) {
            // decode GraphQL id to id
            $response['question'] = GlobalId::fromGlobalId($response['question'])['id'];
            $questionId = (int) $response['question'];
            $question = $this->questionRepo->find($questionId);
            if (!$question) {
                throw new UserError(sprintf('Unknown question with id "%d"', $questionId));
            }
            $questions[] = $question;
            $response['question'] = $question->getId();
            $response['position'] = $question->getPosition();
            if ($question instanceof MediaQuestion) {
                $response[AbstractResponse::TYPE_FIELD_NAME] = 'media_response';
            } else {
                $response[AbstractResponse::TYPE_FIELD_NAME] = 'value_response';
                $decodeValue = \json_decode($response['value'], true);
                $response['value'] = $decodeValue ?? $response['value'];
            }
        }

        return $responses;
    }
}
