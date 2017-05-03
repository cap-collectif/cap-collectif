<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\MediaBundle\Entity\Media;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sonata\MediaBundle\Model\MediaInterface;
use Sonata\MediaBundle\Provider\MediaProviderInterface;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class DownloadController extends Controller
{
    /**
     * @Route("/download/{responseId}/media/{mediaId}", name="app_media_response_download")
     * @ParamConverter("mediaResponse", class="CapcoAppBundle:Responses\MediaResponse", options={"mapping": {"responseId": "id"}})
     * @ParamConverter("media", class="CapcoMediaBundle:Media", options={"mapping": {"mediaId": "id"}})
     * @Cache(smaxage="60", public="true")
     *
     * @param MediaResponse $mediaResponse
     * @param Media         $media
     *
     * @throws AccessDeniedException
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function downloadAction(MediaResponse $mediaResponse, Media $media)
    {
        $response = $this->getProvider($media)
            ->getDownloadResponse(
                $media,
                'reference',
                $this->get('sonata.media.pool')
                    ->getDownloadMode($media)
            );

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
