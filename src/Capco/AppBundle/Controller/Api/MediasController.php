<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Manager\MediaManager;
use Capco\AppBundle\Provider\AllowedExtensions;
use Capco\AppBundle\Twig\MediaExtension;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Constraints\File;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class MediasController extends AbstractController
{
    final public const NO_MEDIA_FOUND = 'NO_MEDIA_FOUND';
    final public const FILE_NOT_ALLOWED = 'FILE_NOT_ALLOWED';

    private readonly ValidatorInterface $validator;
    private readonly MediaManager $mediaManager;
    private readonly MediaExtension $mediaExtension;
    private readonly LoggerInterface $logger;
    private ?ConstraintViolationListInterface $fileUploadViolations;

    public function __construct(
        ValidatorInterface $validator,
        MediaManager $mediaManager,
        MediaExtension $mediaExtension,
        LoggerInterface $logger
    ) {
        $this->validator = $validator;
        $this->mediaManager = $mediaManager;
        $this->mediaExtension = $mediaExtension;
        $this->logger = $logger;
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

        $media = $this->mediaManager->createFileFromUploadedFile($uploadedFile);

        return $this->json(
            [
                'name' => $media->getName(),
                'id' => $media->getId(),
                'size' => self::formatBytes($media->getSize()),
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
        $media = $this->mediaManager->createFileFromUploadedFile($uploadedFile);

        $response = $this->render('@CapcoApp/MediaAdmin/upload.html.twig', [
            'object' => $media,
        ]);
        $response->headers->set('content-type', 'text/html');

        return $response;
    }

    public static function formatBytes(int $bytes): string
    {
        $units = ['O', 'Ko', 'Mo', 'Go', 'To'];
        $power = $bytes > 0 ? floor(log($bytes, 1024)) : 0;

        return number_format($bytes / 1024 ** $power, 1) . ' ' . $units[$power];
    }

    /**
     * For security reasons, we have to check the file size and type.
     */
    private function validateUploadedFile(UploadedFile $file): bool
    {
        $violations = $this->validator->validate($file, [
            new File([
                'maxSize' => '10M',
                'mimeTypes' => AllowedExtensions::ALLOWED_MIMETYPES,
            ]),
        ]);

        $this->setFileUploadViolations($violations);

        return 0 === $violations->count();
    }

    private function setFileUploadViolations($fileUploadViolations)
    {
        $this->fileUploadViolations = $fileUploadViolations;
    }

    private function getFile(Request $request)
    {
        $uploadedFile = $request->files->get('file') ?? $request->files->get('upload');

        if (!$uploadedFile) {
            throw new \RuntimeException(self::NO_MEDIA_FOUND);
        }

        if (!$this->validateUploadedFile($uploadedFile)) {
            $this->logger->error(
                __METHOD__ .
                    ' : ' .
                    $uploadedFile->getMimeType() .
                    ' ' .
                    var_export($this->fileUploadViolations->get(0), true)
            );

            throw new \RuntimeException(self::FILE_NOT_ALLOWED);
        }

        return $uploadedFile;
    }
}
