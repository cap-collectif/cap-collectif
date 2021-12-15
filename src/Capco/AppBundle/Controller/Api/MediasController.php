<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Manager\MediaManager;
use Capco\AppBundle\Twig\MediaExtension;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Validator\Constraints\File;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class MediasController extends AbstractController
{
    private const ALLOWED_MIMETYPES = [
        'image/png', // .png
        'image/svg+xml', // .svg
        'image/gif', // .gif
        'image/jpeg', // .jpeg .jpg
        'application/csv', // .csv
        'text/csv', // .csv
        'text/plain', // .csv
        'application/x-PhpStorm-csv-file', // .csv
        'text/anytext', // .csv
        'text/comma-separated-values', // .csv
        'application/pdf', // .pdf
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/vnd.ms-excel', // .xls
        'application/vnd.msexcel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-powerpoint', // .ppt
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
        'application/vnd.oasis.opendocument.text', // .odt
        'application/vnd.oasis.opendocument.presentation', // .odp
        'application/vnd.oasis.opendocument.spreadsheet', // .ods
    ];

    private ValidatorInterface $validator;
    private MediaManager $mediaManager;
    private MediaExtension $mediaExtension;
    private LoggerInterface $logger;
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
        /** @var UploadedFile $uploadedFile */
        $uploadedFile = $request->files->get('file');

        if (!$uploadedFile) {
            return $this->json(['errorCode' => 'NO_MEDIA_FOUND']);
        }

        if (!$this->validateUploadedFile($uploadedFile)) {
            $this->logger->error(
                __METHOD__ .
                    ' : ' .
                    $uploadedFile->getMimeType() .
                    ' ' .
                    var_export($this->fileUploadViolations->get(0), true)
            );

            return $this->json(['errorCode' => 'FILE_NOT_ALLOWED']);
        }

        $media = $this->mediaManager->createFileFromUploadedFile($uploadedFile);

        return $this->json(
            [
                'name' => $media->getName(),
                'id' => $media->getId(),
                'size' => self::formatBytes($media->getSize()),
                'url' =>
                    $request->getUriForPath('/media') .
                    $this->mediaExtension->path($media, 'reference'),
            ],
            201
        );
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
                'mimeTypes' => self::ALLOWED_MIMETYPES,
            ]),
        ]);

        $this->setFileUploadViolations($violations);

        return 0 === $violations->count();
    }

    private function setFileUploadViolations($fileUploadViolations)
    {
        $this->fileUploadViolations = $fileUploadViolations;
    }

    private function getFileUploadViolations()
    {
        return $this->fileUploadViolations;
    }
}
