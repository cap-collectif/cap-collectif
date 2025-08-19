<?php

declare(strict_types=1);

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Manager\MediaManager;
use Capco\AppBundle\Validator\Constraints\MaxFolderSize;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use TusPhp\Events\TusEvent;
use TusPhp\Events\UploadComplete;
use TusPhp\Events\UploadCreated;
use TusPhp\Tus\Server;

class TusUploadController extends AbstractController
{
    public function __construct(
        private readonly int $tusMediaSizeLimit
    ) {
    }

    /**
     * @Route("/tus-upload/", name="tus_upload_post", options={"i18n" = false}, methods={"PATCH", "HEAD", "POST"})
     * @Route("/tus-upload/{token?}", name="tus_upload", requirements={"token"=".+"}, options={"i18n" = false}, methods={"PATCH", "HEAD", "POST", "GET"})
     */
    public function server(
        Server $server,
        MediaManager $mediaManager,
        EntityManagerInterface $em,
        Filesystem $filesystem,
        ValidatorInterface $validator,
        LoggerInterface $logger
    ): BinaryFileResponse|Response {
        $user = $this->getUser();
        if (!$user?->hasBackOfficeAccess()) {
            throw new AccessDeniedException();
        }

        $server->setMaxUploadSize($this->tusMediaSizeLimit);

        $server->event()->addListener(UploadCreated::NAME, function (TusEvent $event) use ($validator, $logger) {
            $file = $event->getFile();

            $violations = $validator->validate($file->getFileSize(), [
                new MaxFolderSize(),
            ]);

            $violationsCount = $violations->count();

            if (0 < $violationsCount) {
                $logger->error(
                    'An error occured while uploading the file',
                    [
                        'method' => __METHOD__,
                        'file-path' => $file->getFilePath(),
                        'violations' => $violations,
                    ]
                );

                exit;
            }
        });

        $server->event()->addListener(UploadComplete::NAME, function (TusEvent $event) use ($mediaManager, $em, $filesystem, $server) {
            $file = $event->getFile();
            $path = $file->getFilePath();
            $name = $file->getName();

            $media = $mediaManager->createImageFromPath(path: $path, mediaName: $name, createFile: false);
            $em->persist($media);
            $em->flush();

            $providerReference = $media->getProviderReference();
            $headers['File-URL'] = "/media/default/0001/01/{$providerReference}";
            $event->getResponse()->setHeaders($headers);

            $uploadDir = $server->getUploadDir();
            $filesystem->rename($path, "{$uploadDir}/{$providerReference}");
        });

        return $server->serve();
    }
}
