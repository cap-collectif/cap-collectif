<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Form\ReplyType;
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
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

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
     *
     * @param Reply $reply
     *
     * @return Reply
     */
    public function getReplyAction(Reply $reply)
    {
        if ($reply->getAuthor() !== $this->getUser()) {
            throw $this->createAccessDeniedException();
        }

        return $reply;
    }

    /**
     * Add a reply.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Post a reply",
     *  statusCodes={
     *    201 = "Returned when successful",
     *    401 = "Proposal does not exist",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Post("/questionnaires/{questionnaire_id}/replies")
     * @ParamConverter("questionnaire", options={"mapping": {"questionnaire_id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @View(statusCode=201, serializerGroups={"Questionnaires", "Replies", "UsersInfos", "UserMedias"})
     */
    public function postReplyAction(Request $request, Questionnaire $questionnaire)
    {
        $user = $this->getUser();

        if (!$questionnaire->canContribute()) {
            throw new BadRequestHttpException('You can no longer contribute to this questionnaire step.');
        }

        $em = $this->getDoctrine()->getManager();

        if (!$questionnaire->isMultipleRepliesAllowed()) {
            $previousReply = $em
            ->getRepository('CapcoAppBundle:Reply')
            ->getOneForUserAndQuestionnaire($questionnaire, $user)
          ;
            if ((bool) $previousReply) {
                throw new BadRequestHttpException('Only one reply by user is allowed for this questionnaire.');
            }
        }

        if ($questionnaire->isPhoneConfirmationRequired() && !$user->isPhoneConfirmed()) {
            throw new BadRequestHttpException('You must confirm your account via sms to post a reply.');
        }

        $reply = (new Reply())
            ->setAuthor($user)
            ->setQuestionnaire($questionnaire)
            ->setEnabled(true)
        ;

        $form = $this->createForm(ReplyType::class, $reply, ['anonymousAllowed' => $questionnaire->isAnonymousAllowed()]);
        $form->submit($request->request->all());

        if (!$form->isValid()) {
            return $form;
        }

        $em->persist($reply);
        $em->flush();
        $this->get('redis_storage.helper')->recomputeUserCounters($user);

        if ($questionnaire->isAcknowledgeReplies()) {
            $this->get('capco.user_notifier')->acknowledgeReply($questionnaire->getStep()->getProject(), $reply);
        }

        return $this->view(null, 201);
    }

    /**
     * @ApiDoc(
     *  resource=true,
     *  description="Update a reply",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when proposal is not found",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Put("/questionnaires/{questionnaire_id}/replies/{reply_id}")
     * @ParamConverter("questionnaire", options={"mapping": {"questionnaire_id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @ParamConverter("reply", options={"mapping": {"reply_id": "id"}, "repository_method": "find", "map_method_signature": true})
     * @View(statusCode=200, serializerGroups={"Questionnaires", "Replies", "UsersInfos", "UserMedias"})
     */
    public function putReplyAction(Request $request, Questionnaire $questionnaire, Reply $reply)
    {
        if (!$questionnaire->canContribute()) {
            throw new BadRequestHttpException('This reply is no longer editable.');
        }

        if ($this->getUser() !== $reply->getAuthor()) {
            throw new AccessDeniedException();
        }

        $form = $this->createForm(ReplyType::class, $reply);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $this->getDoctrine()->getManager()->flush();

        return $reply;
    }

    /**
     * Delete a reply.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Delete a reply",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when proposal is not found",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Delete("/questionnaires/{questionnaire_id}/replies/{reply_id}")
     * @ParamConverter("questionnaire", options={"mapping": {"questionnaire_id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @ParamConverter("reply", options={"mapping": {"reply_id": "id"}, "repository_method": "find", "map_method_signature": true})
     * @View(statusCode=204)
     *
     * @param Questionnaire $questionnaire
     * @param Reply         $reply
     *
     * @throws BadRequestHttpException
     *
     * @return array
     */
    public function deleteReplyAction(Questionnaire $questionnaire, Reply $reply)
    {
        if ($this->getUser() !== $reply->getAuthor()) {
            throw $this->createAccessDeniedException('You are not the author of this reply');
        }

        if (!$reply) {
            throw $this->createNotFoundException('Reply not found');
        }

        if (!$questionnaire->canContribute()) {
            throw new BadRequestHttpException('This reply is no longer deletable.');
        }

        $em = $this->getDoctrine()->getManager();
        $em->remove($reply);
        $em->flush();
        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());

        return [];
    }
}
