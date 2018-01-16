<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\MediaBundle\Entity\Media;
use Gaufrette\Exception\FileNotFound;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sonata\MediaBundle\Model\MediaInterface;
use Sonata\MediaBundle\Provider\MediaProviderInterface;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class DownloadController extends Controller
{
    /**
     * @Route("/download/{responseId}/media/{mediaId}", name="app_media_response_download")
     * @ParamConverter("mediaResponse", options={"mapping": {"responseId": "id"}})
     * @ParamConverter("media", options={"mapping": {"mediaId": "id"}})
     * @Cache(smaxage="60", public="true")
     */
    public function downloadAction(MediaResponse $mediaResponse, Media $media)
    {
        try {
            $response = $this->getProvider($media)
              ->getDownloadResponse(
                  $media,
                  'reference',
                  $this->get('sonata.media.pool')
                      ->getDownloadMode($media)
              );
        } catch (FileNotFound $exeption) {
            $this->get('logger')->error('File not found for media : ' . $media->getId());

            return new Response('File not found.');
        }

        if ($response instanceof BinaryFileResponse) {
            $response->prepare($this->get('request'));
        }

        if (
            !$mediaResponse->getQuestion()->isPrivate()
            || $this->getUser() === $mediaResponse->getProposal()->getAuthor()
            || $this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')
        ) {
            ob_get_clean();

            return $response;
        }

        throw $this->createAccessDeniedException();
    }

    protected function getProvider(MediaInterface $media): MediaProviderInterface
    {
        return $this->get('sonata.media.pool')->getProvider($media->getProviderName());
    }
}
