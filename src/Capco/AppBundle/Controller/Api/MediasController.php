<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Exception\VocalContributionUploadException;
use Capco\AppBundle\Manager\MediaManager;
use Capco\AppBundle\Service\VocalContributionUploadService;
use Capco\AppBundle\Twig\MediaExtension;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class MediasController extends AbstractController
{
    final public const NO_MEDIA_FOUND = 'NO_MEDIA_FOUND';
    final public const VIRUS_DETECTED = 'VIRUS_DETECTED';

    public function __construct(
        private readonly MediaManager $mediaManager,
        private readonly MediaExtension $mediaExtension,
        private readonly \Capco\AppBundle\Antivirus\AntivirusScanner $antivirusScanner,
        private readonly VocalContributionUploadService $vocalContributionUploadService
    ) {
    }

    /**
     * @Route("/voice-messages", name="upload_voice_message", methods={"POST"}, options={"i18n" = false})
     */
    public function postVoiceMessageAction(Request $request): JsonResponse
    {
        if (!$this->isCsrfTokenValid('voice_message', $request->headers->get('X-CSRF-Token'))) {
            return $this->json(['errorCode' => 'INVALID_CSRF_TOKEN'], Response::HTTP_FORBIDDEN);
        }

        $file = $request->files->get('file');
        if (!$file instanceof UploadedFile) {
            return $this->json(['errorCode' => 'INVALID_VOICE_MESSAGE'], Response::HTTP_BAD_REQUEST);
        }

        $user = $this->getUser();

        try {
            $contribution = $this->vocalContributionUploadService->upload(
                $file,
                $user,
                $request->request->get('participantToken') ?? $request->cookies->get('CapcoParticipant')
            );
        } catch (VocalContributionUploadException $exception) {
            return $this->json(['errorCode' => $exception->errorCode], $exception->statusCode);
        }

        $payload = [
            'vocalId' => GlobalId::toGlobalId('VocalContribution', $contribution->getId()),
        ];
        if (null === $user && null !== $contribution->getParticipant()) {
            $payload['participantToken'] = $contribution->getParticipant()->getToken();
        }

        return $this->json($payload, Response::HTTP_CREATED);
    }

    /**
     * @Route("/files", name="upload_files", options={"i18n" = false})
     */
    public function postMediaAction(Request $request): JsonResponse
    {
        try {
            $uploadedFile = $this->getFile($request);
        } catch (\RuntimeException $exception) {
            return $this->json(['errorCode' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        }

        $scanResult = $this->antivirusScanner->scanAndDeleteIfInfected($uploadedFile->getPathname());
        if ($scanResult->isInfected()) {
            return $this->json(['errorCode' => self::VIRUS_DETECTED], 400);
        }

        $media = $this->mediaManager->createFileFromUploadedFile($uploadedFile);

        return $this->json(
            [
                'name' => $media->getName(),
                'id' => $media->getId(),
                'size' => $this->mediaManager::formatBytes($media->getSize()),
                'url' => $request->getUriForPath('/media') .
                    $this->mediaExtension->getMediaUrl($media, 'reference'),
                'type' => $media->getContentType(),
            ],
            201
        );
    }

    /**
     * @Route("/files/ckeditor", name="upload_files_ckeditor", options={"i18n" = false})
     */
    public function ckEditorUpload(Request $request): Response
    {
        try {
            $uploadedFile = $this->getFile($request);
        } catch (\RuntimeException $exception) {
            return $this->json(['errorCode' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        }

        $scanResult = $this->antivirusScanner->scanAndDeleteIfInfected($uploadedFile->getPathname());
        if ($scanResult->isInfected()) {
            return $this->json(['errorCode' => self::VIRUS_DETECTED], 400);
        }

        $media = $this->mediaManager->createFileFromUploadedFile($uploadedFile);

        $response = $this->render('@CapcoApp/MediaAdmin/upload.html.twig', [
            'object' => $media,
        ]);
        $response->headers->set('content-type', 'text/html');

        return $response;
    }

    private function getFile(Request $request)
    {
        $uploadedFile = $request->files->get('file') ?? $request->files->get('upload');

        if (!$uploadedFile) {
            throw new \RuntimeException(self::NO_MEDIA_FOUND);
        }

        $this->mediaManager->validateUploadedFile($uploadedFile);

        return $uploadedFile;
    }
}
