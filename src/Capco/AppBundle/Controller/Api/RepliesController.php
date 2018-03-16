<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reply;
use FOS\RestBundle\Controller\Annotations\Delete;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\Put;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class RepliesController extends FOSRestController
{
    /**
     * @Security("has_role('ROLE_USER')")
     * @Get("/questionnaires/{questionnaire_id}/replies")
     * @ParamConverter("questionnaire", options={"mapping": {"questionnaire_id": "id"}})
     * @View(statusCode=200, serializerGroups={"Replies", "UsersInfos", "UserMedias"})
     */
    public function getUserRepliesByFormAction(Questionnaire $questionnaire)
    {
        $em = $this->get('doctrine')->getManager();
        $userReplies = $em
          ->getRepository('CapcoAppBundle:Reply')
          ->findBy([
              'questionnaire' => $questionnaire,
              'author' => $this->getUser(),
            ])
        ;

        return ['replies' => $userReplies];
    }

    /**
     * Get a reply.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get a reply",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when opinion is not found",
     *  }
     * )
     *
     * @Get("/questionnaires/{questionnaire_id}/replies/{reply_id}")
     * @ParamConverter("reply", options={"mapping": {"reply_id": "id"}, "repository_method": "find", "map_method_signature": true})
     * @View(statusCode=200, serializerGroups={"Replies", "UsersInfos", "UserMedias", "Steps"})
     * @Cache(smaxage="120", public=true)
     * @Security("has_role('ROLE_USER')")
     */
    public function getReplyAction(Reply $reply)
    {
        if ($reply->getAuthor() !== $this->getUser()) {
            throw $this->createAccessDeniedException();
        }

        return $reply;
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Post("/questionnaires/{questionnaire_id}/replies")
     * @ParamConverter("questionnaire", options={"mapping": {"questionnaire_id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @View(statusCode=201, serializerGroups={"Questionnaires", "Replies", "UsersInfos", "UserMedias"})
     */
    public function postReplyAction(Request $request, Questionnaire $questionnaire)
    {
        throw new BadRequestHttpException('Deprecated.');
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Put("/questionnaires/{questionnaire_id}/replies/{reply_id}")
     * @ParamConverter("questionnaire", options={"mapping": {"questionnaire_id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @ParamConverter("reply", options={"mapping": {"reply_id": "id"}, "repository_method": "find", "map_method_signature": true})
     * @View(statusCode=200, serializerGroups={"Questionnaires", "Replies", "UsersInfos", "UserMedias"})
     */
    public function putReplyAction(Request $request, Questionnaire $questionnaire, Reply $reply)
    {
        throw new BadRequestHttpException('Deprecated.');
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Delete("/questionnaires/{questionnaire_id}/replies/{reply_id}")
     * @ParamConverter("questionnaire", options={"mapping": {"questionnaire_id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @ParamConverter("reply", options={"mapping": {"reply_id": "id"}, "repository_method": "find", "map_method_signature": true})
     * @View(statusCode=204)
     */
    public function deleteReplyAction(Questionnaire $questionnaire, Reply $reply)
    {
        throw new BadRequestHttpException('Deprecated.');
    }
}
