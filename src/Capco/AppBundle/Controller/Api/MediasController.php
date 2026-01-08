<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Antivirus\AntivirusScanner;
use Capco\AppBundle\Manager\MediaManager;
use Capco\AppBundle\Twig\MediaExtension;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
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
        private readonly AntivirusScanner $antivirusScanner
    ) {
    }

    /**
     * @Route("/files", name="upload_files", options={"i18n" = false})
     */
    public function postMediaAction(Request $request): JsonResponse
    {
        try {
            $uploadedFile = $this->getFile($request);
        } catch (\RuntimeException $exception) {
            return $this->json(['errorCode' => $exception->getMessage()]);
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
            return $this->json(['errorCode' => $exception->getMessage()]);
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
