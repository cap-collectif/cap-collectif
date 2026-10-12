<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Entity\Security\UserIdentificationCodeList;
use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\Generator\CSV\IdentificationCodeListCSVGenerator;
use Capco\AppBundle\GraphQL\Resolver\Questionnaire\QuestionnaireResultsAccessResolver;
use Capco\AppBundle\Provider\MediaProvider;
use Capco\AppBundle\Repository\Security\UserIdentificationCodeListRepository;
use Capco\AppBundle\Service\MediaAccessResolver;
use Capco\AppBundle\Service\ParticipantAuthentication;
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
    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly UserIdentificationCodeListRepository $userIdentificationCodeListRepository,
        private readonly MediaProvider $mediaProvider,
        private readonly QuestionnaireResultsAccessResolver $questionnaireResultsAccessResolver,
        private readonly ParticipantAuthentication $participantAuthentication,
        private readonly MediaAccessResolver $mediaAccess
    ) {
    }

    /**
     * @Route("/download/{responseId}/media/{mediaId}", name="app_media_response_download", options={"i18n" = false})
     * @Entity("mediaResponse", options={"mapping": {"responseId": "id"}})
     * @Entity("media", options={"mapping": {"mediaId": "id"}})
     */
    public function downloadAction(MediaResponse $mediaResponse, Media $media, Request $request): Response
    {
        if (!\in_array($media, [...$mediaResponse->getMedias()], true)) {
            throw $this->createNotFoundException();
        }

        $viewer = $this->getUser();

        try {
            if (MediaAccessResolver::isPrivateResponse($mediaResponse)) {
                $this->participantAuthentication->authenticate($request);
            }
            $hasAccess = $this->questionnaireResultsAccessResolver->canViewResponse($mediaResponse, $viewer);
        } catch (ParticipantNotFoundException) {
            $hasAccess = false;
        }

        if (!$hasAccess || !$this->mediaAccess->canView($media, $viewer)) {
            return new Response('Sorry, you are not allowed to see this file.', Response::HTTP_FORBIDDEN, ['Cache-Control' => 'private, no-store']);
        }

        // Depending on the file type we redirect to the file or download it.
        $type = $media->getContentType();
        if (\in_array($type, ['application/pdf', 'image/jpeg', 'image/png'], true)) {
            $url = $request->getUriForPath('/media') . $this->get(MediaExtension::class)->getMediaUrl($media, 'reference');
            $response = new RedirectResponse($url);
        } else {
            $file = $this->mediaProvider->getOrGenerateReferenceFile($media);
            $response = new StreamedResponse(
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

        $response->setPrivate();
        $response->headers->addCacheControlDirective('no-store');

        return $response;
    }

    /**
     * @Route("/identificationCodesList/download/cap-collectif-codes-{listId}.csv", name="app_identification_codes_list_download", options={"i18n" = false})
     * @Security("is_granted('ROLE_ADMIN')")
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
