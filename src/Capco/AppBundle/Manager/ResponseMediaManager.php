<?php

namespace Capco\AppBundle\Manager;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Helper\ArrayHelper;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManager;
use Symfony\Component\HttpFoundation\Request;

class ResponseMediaManager
{
    protected $request;
    protected $entityManager;
    protected $proposal;
    protected $mediaManager;

    public function __construct(EntityManager $entityManager, MediaManager $mediaManager)
    {
        $this->entityManager = $entityManager;
        $this->mediaManager = $mediaManager;
    }

    public function updateMediasFromRequest(Proposal $proposal, Request $request): Request
    {
        if (!$proposal && !$request) {
            throw new \InvalidArgumentException('Proposal or Request must not be null.');
        }

        $this->proposal = $proposal;
        $this->request = $request;

        $uploadedMedias = ArrayHelper::unflatten($this->request->files->all());
        $responsesKeys = array_keys($uploadedMedias['responses']);

        foreach ($responsesKeys as $responsesKey) {
            $questionId = $this->request->request->get('responses_' . $responsesKey . '_question');

            /** @var MediaResponse $response */
            $response = $this->proposal->getResponses()->filter(
                function (AbstractResponse $element) use ($questionId) {
                    return (int) $element->getQuestion()->getId() === (int) $questionId;
                }
            )->first();

            if ($response) {
                $this->removeMedias($response);
                $this->addMediasFromArray($uploadedMedias, $responsesKey, $response);
            }

            $this->request->request->remove('responses_' . $questionId . '_question');
        }

        return $this->request;
    }

    public function resolveTypeOfResponses(array $valueResponses, array $mediasResponses): array
    {
        if (count($mediasResponses) === 0 || !isset($mediasResponses['responses'])) {
            $valueResponses['responses'] = array_map(function ($valueResponse) {
                $valueResponse['_type'] = 'value_response';

                return $valueResponse;
            }, $valueResponses['responses']);

            return $valueResponses;
        }

        $mediasResponsesKeys = array_keys($mediasResponses['responses']);
        $valueResponsesKeys = array_keys($valueResponses['responses']);

        foreach ($valueResponsesKeys as $valueResponsesKey) {
            if (in_array($valueResponsesKey, $mediasResponsesKeys, true)) {
                $valueResponses['responses'][$valueResponsesKey]['_type'] = 'media_response';
            } else {
                $valueResponses['responses'][$valueResponsesKey]['_type'] = 'value_response';
            }
        }

        return $valueResponses;
    }

    protected function removeMedias(MediaResponse $response)
    {
        foreach ($response->getMedias() as $media) {
            $this->entityManager->remove($media);
        }

        $response->setMedias(new ArrayCollection());
    }

    protected function addMediasFromArray(array $array, int $key, MediaResponse $response)
    {
        foreach ($array['responses'][$key]['value'] as $file) {
            $response->addMedia($this->mediaManager->createFileFromUploadedFile($file, 'sources'));
        }
    }
}
