<?php

declare(strict_types=1);

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Manager\MediaManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use TusPhp\Events\TusEvent;
use TusPhp\Events\UploadComplete;
use TusPhp\Tus\Server;

class TusUploadController extends AbstractController
{
    /**
     * @Route("/tus-upload/", name="tus_upload_post", options={"i18n" = false}, methods={"PATCH", "HEAD", "POST"})
     * @Route("/tus-upload/{token?}", name="tus_upload", requirements={"token"=".+"}, options={"i18n" = false}, methods={"PATCH", "HEAD", "POST", "GET"})
     */
    public function server(
        Server $server,
        MediaManager $mediaManager,
        EntityManagerInterface $em,
        Filesystem $filesystem,
    ): BinaryFileResponse|Response {
        $user = $this->getUser();
        if (!$user?->hasBackOfficeAccess()) {
            throw new AccessDeniedException();
        }
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
