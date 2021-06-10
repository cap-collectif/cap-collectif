<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Manager\MediaManager;
use Capco\AppBundle\Twig\MediaExtension;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class MediasController extends AbstractController
{
    //TODO: Sécurité : Penser à sécuriser l'API d'upload de fichier désormais publique (un utilisateur non enregistré doit
    // pouvoir uploader un fichier dans le formulaire d'inscription s'il y a un type de question média

    /**
     * @Route("/files", name="upload_files", options={"i18n" = false})
     */
    public function postMediaAction(Request $request): JsonResponse
    {
        $uploadedMedia = $request->files->get('file');
        $mediaManager = $this->get(MediaManager::class);

        if (!$uploadedMedia) {
            return $this->json(['errorCode' => 'NO_MEDIA_FOUND']);
        }

        $media = $mediaManager->createFileFromUploadedFile($uploadedMedia);

        return $this->json(
            [
                'name' => $media->getName(),
                'id' => $media->getId(),
                'size' => self::formatBytes($media->getSize()),
                'url' =>
                    $request->getUriForPath('/media') .
                    $this->get(MediaExtension::class)->path($media, 'reference'),
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
}
