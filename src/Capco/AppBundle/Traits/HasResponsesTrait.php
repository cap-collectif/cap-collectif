<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Doctrine\Common\Collections\Collection;

// must have setResponseOn to use this trait
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

    public function getResponses(): Collection
    {
        return $this->responses;
    }

    public function setResponses(Collection $responses): self
    {
        foreach ($responses as $response) {
            $this->addResponse($response);
        }

        return $this;
    }
}
