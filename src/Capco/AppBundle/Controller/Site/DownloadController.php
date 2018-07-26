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
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

class DownloadController extends Controller
{
    /**
     * @Route("/download/{responseId}/media/{mediaId}", name="app_media_response_download")
     * @ParamConverter("mediaResponse", options={"mapping": {"responseId": "id"}})
     * @ParamConverter("media", options={"mapping": {"mediaId": "id"}})
     * @Security("has_role('ROLE_ADMIN')")
     */
    public function downloadAction(MediaResponse $mediaResponse, Media $media, Request $request)
    {
        if (
            !$mediaResponse->getQuestion()->isPrivate() ||
            $this->getUser() === $mediaResponse->getProposal()->getAuthor()
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
                    $this->get('sonata.media.twig.extension')->path($media, 'reference');

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
