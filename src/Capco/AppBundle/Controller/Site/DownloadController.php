<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Twig\MediaExtension;
use Capco\MediaBundle\Entity\Media;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class DownloadController extends Controller
{
    /**
     * @Route("/download/{responseId}/media/{mediaId}", name="app_media_response_download")
     * @Entity("mediaResponse", options={"mapping": {"responseId": "id"}})
     * @Entity("media", options={"mapping": {"mediaId": "id"}})
     */
    public function downloadAction(MediaResponse $mediaResponse, Media $media, Request $request)
    {
        if (
            !$mediaResponse->getQuestion()->isPrivate() ||
            $this->getUser() === $mediaResponse->getProposal()->getAuthor() ||
            $this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')
        ) {
            $provider = $this->get('sonata.media.pool')->getProvider($media->getProviderName());

            // In case something bad happened, and we lost the file…
            if (!$provider->getReferenceFile($media)->exists()) {
                $this->get('logger')->error('File not found for media : ' . $media->getId());

                return new Response('File not found.');
            }

            // Depending on the file type we redirect to the file or download it
            $type = $media->getContentType();
            $redirectFileTypes = ['application/pdf', 'image/jpeg', 'image/png'];
            if (\in_array($type, $redirectFileTypes, true)) {
                $url =
                    $request->getUriForPath('/media') .
                    $this->get(MediaExtension::class)->path($media, 'reference');

                return new RedirectResponse($url);
            }

            $downloadMode = $this->get('sonata.media.pool')->getDownloadMode($media);
            $response = $provider->getDownloadResponse($media, 'reference', $downloadMode);
            if ($response instanceof BinaryFileResponse) {
                $response->prepare($request);
            }

            // Avoid some files to be corrupt
            ob_get_clean();

            return $response;
        }

        return new Response('Sorry, you are not allowed to see this file.');
    }
}
