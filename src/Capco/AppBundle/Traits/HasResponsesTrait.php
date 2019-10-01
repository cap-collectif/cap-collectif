<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

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

        $this->setResponseOn($response);
        $this->responses->add($response);

        return $this;
    }

    /**
     * @deprecated Please see https://github.com/cap-collectif/platform/issues/8924 (causing performance issues)
     * @return Collection
     */
    public function getResponses(): Collection
    {
        $responses = new ArrayCollection($this->responses->toArray());
        $questions = $this->getResponsesQuestions();

        foreach ($questions as $question) {
            $found = false;
            foreach ($responses as $response) {
                if ($response->getQuestion()->getId() === $question->getId()) {
                    $found = true;
                }
            }
            // Concat missing responses
            if (!$found) {
                if ($question instanceof MediaQuestion) {
                    $response = new MediaResponse();
                } elseif ($question instanceof MultipleChoiceQuestion) {
                    $response = new ValueResponse();
                    $value = 'select' === $question->getInputType() ? null : ['labels' => [], 'other' => null];
                    $response->setValue($value);
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
