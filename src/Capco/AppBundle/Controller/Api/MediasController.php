<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Entity\IdeaComment;
use Capco\AppBundle\Entity\IdeaVote;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Event\CommentChangedEvent;
use Capco\AppBundle\Form\CommentType;
use Capco\AppBundle\Form\IdeaType;
use Capco\AppBundle\Form\IdeaVoteType;
use Capco\AppBundle\Form\ReportingType;
use FOS\RestBundle\Controller\Annotations\Delete;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Request\ParamFetcherInterface;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

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
