<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Entity\Responses\ValueResponse;

// must have setResponseOn and getResponsesQuestions to use this trait
trait HasResponsesTrait
{
    public function addResponse(AbstractResponse $response): self
    {
        foreach ($this->responses as $currentResponse) {
            $questionId = $currentResponse->getQuestion()->getId();

            if ($response->getQuestion()->getId() === $questionId) {
                if ($response instanceof ValueResponse) {
                    $currentResponse->setValue($response->getValue());
                }

                if ($response instanceof MediaResponse) {
                    $currentResponse->setMedias($response->getMedias());
                }

                $currentResponse->setUpdatedAt(new \DateTime());

                return $this;
            }
        }

        $this->responses->add($response);
        $this->setResponseOn($response);

        return $this;
    }

    public function getResponses(): Collection
    {
        $responses = $this->responses;
        $questions = $this->getResponsesQuestions();

        foreach ($questions as $question) {
            $found = false;
            foreach ($this->responses as $response) {
                if ($response->getQuestion()->getId() === $question->getId()) {
                    $found = true;
                }
            }
            // Concat missing responses
            if (!$found) {
                if ($question instanceof MediaQuestion) {
                    $response = new MediaResponse();
                } else {
                    $response = new ValueResponse();
                }
                $response->setQuestion($question);
                $responses->add($response);
            }
        }

        return $responses;
    }

    public function setResponses(Collection $responses): self
    {
        foreach ($responses as $response) {
            $this->addResponse($response);
        }

        return $this;
    }
}
