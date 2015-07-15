<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Entity\IdeaComment;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Capco\AppBundle\Form\CommentType;
use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Event\AbstractCommentChangedEvent;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use FOS\RestBundle\Request\ParamFetcherInterface;

class IdeasController extends FOSRestController
{
    /**
     * Get idea comments.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get idea comments",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Idea does not exist",
     *  }
     * )
     *
     * @Get("/ideas/{id}/comments")
     * @ParamConverter("idea", options={"mapping": {"id": "id"}})
     * @QueryParam(name="offset", requirements="[0-9.]+", default="0")
     * @QueryParam(name="limit", requirements="[0-9.]+", default="10")
     * @QueryParam(name="filter", requirements="(old|last|popular)", default="last")
     * @View(serializerGroups={"Comments", "UsersInfos"})
     */
    public function getIdeaCommentsAction(Idea $idea, ParamFetcherInterface $paramFetcher)
    {
        $offset = $paramFetcher->get('offset');
        $limit = $paramFetcher->get('limit');
        $filter = $paramFetcher->get('filter');

        $paginator = $this->getDoctrine()->getManager()
                    ->getRepository('CapcoAppBundle:IdeaComment')
                    ->getEnabledByIdea($idea, $offset, $limit, $filter);

        $comments = [];
        foreach ($paginator as $comment) {
            $comments[] = $comment;
        }

        $countWithAnswers = $this->getDoctrine()->getManager()
                      ->getRepository('CapcoAppBundle:IdeaComment')
                      ->countCommentsAndAnswersEnabledByIdea($idea);

        return [
            'comments_and_answers_count' => intval($countWithAnswers),
            'comments_count' => count($paginator),
            'comments' => $comments,
            'is_reporting_enabled' => $this->get('capco.toggle.manager')->isActive('reporting'),
        ];
    }

    /**
     * Get ideas.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get ideas",
     *  statusCodes={
     *    200 = "Returned when successful",
     *  }
     * )
     *
     * @Get("/ideas")
     * @QueryParam(name="from", nullable=true)
     * @QueryParam(name="to", nullable=true)
     * @View(serializerGroups={})
     */
    public function getIdeasAction(ParamFetcherInterface $paramFetcher)
    {
        $from = $paramFetcher->get('from');
        $to = $paramFetcher->get('to');

        $ideas = $this->getDoctrine()->getManager()
                    ->getRepository('CapcoAppBundle:Idea')
                    ->getEnabledWith($from, $to);

        return [
            'count' => count($ideas),
        ];
    }

    /**
     * Add an idea comment.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Post an idea comments",
     *  statusCodes={
     *    201 = "Returned when successful",
     *    404 = "Idea does not exist",
     *  }
     * )
     *
     * @Post("/ideas/{id}/comments")
     * @ParamConverter("idea", options={"mapping": {"id": "id"}})
     * @View(statusCode=201, serializerGroups={"Comments", "UsersInfos"})
     */
    public function postIdeaCommentsAction(Request $request, Idea $idea)
    {
        $user = $this->getUser();

        $comment = (new IdeaComment())
                    ->setAuthorIp($request->getClientIp())
                    ->setAuthor($user)
                    ->setIdea($idea)
                    ->setIsEnabled(true)
                ;

        $form = $this->createForm(new CommentType($user), $comment);
        $form->handleRequest($request);

        if (!$form->isValid()) {
            return $form;
        }

        $parent = $comment->getParent();
        if ($parent) {
            if (!$parent instanceof IdeaComment || $idea != $parent->getIdea()) {
                throw $this->createNotFoundException('This parent comment is not linked to this idea');
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
