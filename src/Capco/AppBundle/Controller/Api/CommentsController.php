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

        $report = (new Reporting())->setReporter($this->getUser())->setComment($comment);
        $form = $this->createForm(ReportingType::class, $report);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $this->get('doctrine.orm.entity_manager')->persist($report);
        $this->get('doctrine.orm.entity_manager')->flush();
        $this->get('capco.report_notifier')->onCreate($report);

        return $report;
    }
}
