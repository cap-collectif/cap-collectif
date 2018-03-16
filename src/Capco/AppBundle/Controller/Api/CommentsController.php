<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\CommentVote;
use Capco\AppBundle\Entity\Reporting;
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
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class CommentsController extends FOSRestController
{
    /**
     * Get comments.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get comments",
     *  statusCodes={
     *    200 = "Returned when successful",
     *  }
     * )
     *
     * @Get("/comments")
     * @QueryParam(name="from", nullable=true)
     * @QueryParam(name="to", nullable=true)
     * @View(serializerGroups={})
     */
    public function getCommentsAction(ParamFetcherInterface $paramFetcher)
    {
        $from = $paramFetcher->get('from');
        $to = $paramFetcher->get('to');

        $comments = $this->getDoctrine()->getManager()
                    ->getRepository('CapcoAppBundle:Comment')
                    ->getEnabledWith($from, $to);

        return [
            'count' => \count($comments),
        ];
    }

    /**
     * Vote on comment.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Vote on comment",
     *  statusCodes={
     *    201 = "Returned when successful",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Post("/comments/{commentId}/votes")
     * @ParamConverter("comment", options={"mapping": {"commentId": "id"}})
     * @View(statusCode=201, serializerGroups={})
     */
    public function postCommentVoteAction(Comment $comment)
    {
        $user = $this->getUser();
        $em = $this->getDoctrine()->getManager();
        $previousVote = $em
            ->getRepository('CapcoAppBundle:CommentVote')
            ->findOneBy(['user' => $user, 'comment' => $comment]);

        if ($previousVote) {
            throw new BadRequestHttpException('Already voted.');
        }

        if (!$comment->canVote()) {
            throw new AccessDeniedHttpException($this->get('translator')->trans('comment.error.no_contribute', [], 'CapcoAppBundle'));
        }

        $vote = (new CommentVote())
            ->setComment($comment)
            ->setUser($user)
        ;

        $comment->incrementVotesCount();
        $em->persist($vote);
        $em->flush();
    }

    /**
     * Delete vote on comment.
     *
     * Vote on comment
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Delete vote on comment",
     *  statusCodes={
     *    204 = "Returned when successful",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Delete("/comments/{commentId}/votes")
     * @ParamConverter("comment", options={"mapping": {"commentId": "id"}})
     * @View()
     */
    public function deleteCommentVoteAction(Comment $comment)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $vote = $em
            ->getRepository('CapcoAppBundle:CommentVote')
            ->findOneBy(['user' => $this->getUser(), 'comment' => $comment]);

        if (!$vote) {
            throw new BadRequestHttpException('You have not voted for this comment.');
        }

        $comment->decrementVotesCount();
        $em->remove($vote);
        $em->flush();
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Post("/comments/{commentId}/reports")
     * @ParamConverter("comment", options={"mapping": {"commentId": "id"}})
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postCommentReportAction(Request $request, Comment $comment)
    {
        if ($this->getUser() === $comment->getAuthor()) {
            throw new AccessDeniedHttpException();
        }

        $report = (new Reporting())
            ->setReporter($this->getUser())
            ->setComment($comment)
        ;

        $form = $this->createForm(new ReportingType(), $report, ['csrf_protection' => false]);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $this->get('doctrine.orm.entity_manager')->persist($report);
        $this->get('doctrine.orm.entity_manager')->flush();
        $this->get('capco.notify_manager')->sendNotifyMessage($report);

        return $report;
    }
}
