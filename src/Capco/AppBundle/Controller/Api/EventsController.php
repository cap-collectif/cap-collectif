<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\Form\CommentType;
use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Event\AbstractCommentChangedEvent;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use FOS\RestBundle\Request\ParamFetcherInterface;

class EventsController extends FOSRestController
{
    /**
     * Get event comments.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get event comments",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Event does not exist",
     *  }
     * )
     *
     * @Get("/events/{id}/comments")
     * @ParamConverter("event", options={"mapping": {"id": "id"}})
     * @QueryParam(name="offset", requirements="[0-9.]+", default="0")
     * @QueryParam(name="limit", requirements="[0-9.]+", default="10")
     * @QueryParam(name="filter", requirements="(old|last|popular)", default="last")
     * @View(serializerGroups={"Comments", "UsersInfos"})
     */
    public function getEventCommentsAction(Event $event, ParamFetcherInterface $paramFetcher)
    {
        $offset = $paramFetcher->get('offset');
        $limit = $paramFetcher->get('limit');
        $filter = $paramFetcher->get('filter');

        $paginator = $this->getDoctrine()->getManager()
                    ->getRepository('CapcoAppBundle:EventComment')
                    ->getEnabledByEvent($event, $offset, $limit, $filter);

        $comments = [];
        foreach ($paginator as $comment) {
            $comments[] = $comment;
        }

        $countWithAnswers = $this->getDoctrine()->getManager()
                      ->getRepository('CapcoAppBundle:EventComment')
                      ->countCommentsAndAnswersEnabledByEvent($event);

        return [
            'comments_and_answers_count' => intval($countWithAnswers),
            'comments_count' => count($paginator),
            'comments' => $comments,
            'is_reporting_enabled' => $this->get('capco.toggle.manager')->isActive('reporting'),
        ];
    }

    /**
     * Add an event comment.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Post an event comments",
     *  statusCodes={
     *    201 = "Returned when successful",
     *    404 = "Event does not exist",
     *  }
     * )
     *
     * @Post("/events/{id}/comments")
     * @ParamConverter("evetn", options={"mapping": {"id": "id"}})
     * @View(statusCode=201, serializerGroups={"Comments", "UsersInfos"})
     */
    public function postEventCommentsAction(Request $request, Event $event)
    {
        $user = $this->getUser();

        $comment = (new EventComment())
                    ->setAuthorIp($request->getClientIp())
                    ->setAuthor($user)
                    ->setEvent($event)
                    ->setIsEnabled(true)
                ;

        $form = $this->createForm(new CommentType($user), $comment);
        $form->handleRequest($request);

        if (!$form->isValid()) {
            return $form;
        }

        $parent = $comment->getParent();
        if ($parent) {
            if ($event != $parent->getEvent()) {
                throw $this->createNotFoundException('This parent comment is not linked to this event');
            }
            if ($parent->getParent() != null) {
                throw new BadRequestHttpException('You can\'t answer the answer of a comment.');
            }
        }


        $this->getDoctrine()->getManager()->persist($comment);
        $this->getDoctrine()->getManager()->flush();
        $this->get('event_dispatcher')->dispatch(
            CapcoAppBundleEvents::ABSTRACT_COMMENT_CHANGED,
            new AbstractCommentChangedEvent($comment, 'add')
        );
    }
}
