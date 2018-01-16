<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\MediaBundle\Entity\Media;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class DownloadController extends Controller
{
    /**
     * @Route("/download/{responseId}/media/{mediaId}", name="app_media_response_download")
     * @ParamConverter("mediaResponse", options={"mapping": {"responseId": "id"}})
     * @ParamConverter("media", options={"mapping": {"mediaId": "id"}})
     */
    public function downloadAction(MediaResponse $mediaResponse, Media $media, Request $request)
    {
        if (
            !$mediaResponse->getQuestion()->isPrivate()
            || $this->getUser() === $mediaResponse->getProposal()->getAuthor()
            || $this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')
        ) {
            $type = $media->getContentType();
            if ('application/pdf' === $type || 'image/jpeg' === $type || 'image/png' === $type) {
                $url = $request->getUriForPath('/media') . $this->get('sonata.media.twig.extension')->path($media, 'reference');

                return new RedirectResponse($url);
            }

            $downloadMode = $this->get('sonata.media.pool')->getDownloadMode($media);
            $provider = $this->get('sonata.media.pool')->getProvider($media->getProviderName());
            $response = $provider->getDownloadResponse($media, 'reference', $downloadMode);
            if ($response instanceof BinaryFileResponse) {
                $response->prepare($this->get('request'));
            }

            return $response;
        }

        return new Response('Sorry, you are not allowed to see this file.');
    }
}
