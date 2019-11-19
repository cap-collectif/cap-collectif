<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Manager\MediaManager;
use Capco\AppBundle\Twig\MediaExtension;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\Request;

class MediasController extends FOSRestController
{
    //TODO: Sécurité : Penser à sécuriser l'API d'upload de fichier désormais publique (un utilisateur non enregistré doit
    // pouvoir uploader un fichier dans le formulaire d'inscription s'il y a un type de question média
    /**
     * @Post("/files")
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postMediaAction(Request $request)
    {
        $uploadedMedia = $request->files->get('file');
        $mediaManager = $this->get(MediaManager::class);

        if (!$uploadedMedia) {
            return;
        }

        $media = $mediaManager->createFileFromUploadedFile($uploadedMedia);

        return [
            'name' => $media->getName(),
            'id' => $media->getId(),
            'size' => $this->formatBytes($media->getSize()),
            'url' =>
                $request->getUriForPath('/media') .
                    $this->get(MediaExtension::class)->path($media, 'reference'),
        ];
    }

    private function formatBytes(int $bytes): string
    {
        $units = ['O', 'Ko', 'Mo', 'Go', 'To'];
        $power = $bytes > 0 ? floor(log($bytes, 1024)) : 0;

        return number_format($bytes / 1024 ** $power, 1) . ' ' . $units[$power];
    }
}
