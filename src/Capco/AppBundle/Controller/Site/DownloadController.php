<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Entity\Security\UserIdentificationCodeList;
use Capco\AppBundle\Generator\CSV\IdentificationCodeListCSVGenerator;
use Capco\AppBundle\Provider\MediaProvider;
use Capco\AppBundle\Repository\Security\UserIdentificationCodeListRepository;
use Capco\AppBundle\Twig\MediaExtension;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Annotation\Route;

class DownloadController extends Controller
{
    private LoggerInterface $logger;
    private UserIdentificationCodeListRepository $userIdentificationCodeListRepository;
    private MediaProvider $mediaProvider;

    public function __construct(
        LoggerInterface $logger,
        UserIdentificationCodeListRepository $userIdentificationCodeListRepository,
        MediaProvider $mediaProvider
    ) {
        $this->logger = $logger;
        $this->userIdentificationCodeListRepository = $userIdentificationCodeListRepository;
        $this->mediaProvider = $mediaProvider;
    }

    /**
     * @Route("/download/{responseId}/media/{mediaId}", name="app_media_response_download", options={"i18n" = false})
     * @Entity("mediaResponse", options={"mapping": {"responseId": "id"}})
     * @Entity("media", options={"mapping": {"mediaId": "id"}})
     */
    public function downloadAction(MediaResponse $mediaResponse, Media $media, Request $request)
    {
        if (
            !$mediaResponse->getQuestion()
            || !$mediaResponse->getQuestion()->isPrivate()
            || $this->getUser() === $mediaResponse->getProposal()->getAuthor()
            || $this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')
        ) {
            // Depending on the file type we redirect to the file or download it
            $type = $media->getContentType();
            $redirectFileTypes = ['application/pdf', 'image/jpeg', 'image/png'];
            if (\in_array($type, $redirectFileTypes, true)) {
                $url =
                    $request->getUriForPath('/media') .
                    $this->get(MediaExtension::class)->getMediaUrl($media, 'reference');

                return new RedirectResponse($url);
            }

            $file = $this->mediaProvider->getOrGenerateReferenceFile($media);

            return new StreamedResponse(
                static function () use ($file) {
                    echo $file->getContent();
                },
                200,
                [
                    'Content-Type' => $media->getContentType(),
                    'Content-Disposition' => sprintf(
                        'attachment; filename="%s"',
                        $media->getMetadataValue('filename')
                    ),
                ]
            );
        }

        return new Response('Sorry, you are not allowed to see this file.');
    }

    /**
     * @Route("/identificationCodesList/download/cap-collectif-codes-{listId}.csv", name="app_identification_codes_list_download", options={"i18n" = false})
     * @Security("has_role('ROLE_ADMIN')")
     */
    public function downloadIdentificationCodesListAction(string $listId): Response
    {
        $list = $this->getUserIdentificationCodeList($listId);

        return IdentificationCodeListCSVGenerator::generateFromList($list);
    }

    private function getUserIdentificationCodeList(string $globalId): UserIdentificationCodeList
    {
        $decoded = GlobalId::fromGlobalId($globalId);
        if (isset($decoded['id'])) {
            $list = $this->userIdentificationCodeListRepository->find($decoded['id']);
            if ($list) {
                return $list;
            }
        }

        throw new NotFoundHttpException('no list matching id');
    }
}
