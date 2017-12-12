<?php

namespace Capco\AppBundle\Controller\Api;

use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\Request;

class MediasController extends FOSRestController
{
    /**
     * @Security("has_role('ROLE_USER')")
     * @Post("/files")
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postMediaAction(Request $request)
    {
        $uploadedMedia = $request->files->get('file');
        $mediaManager = $this->get('capco.media.manager');
        $em = $this->get('doctrine.orm.entity_manager');

        if (!$uploadedMedia) {
            return;
        }

        $media = $mediaManager->createFileFromUploadedFile($uploadedMedia);
        $em->persist($media);
        $em->flush();

        return $media;
    }
}
