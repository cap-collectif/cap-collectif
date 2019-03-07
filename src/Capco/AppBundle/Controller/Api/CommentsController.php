<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Form\ReportingType;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class CommentsController extends FOSRestController
{
    /**
     * @Post("/comments/{commentId}/reports")
     * @ParamConverter("comment", options={"mapping": {"commentId": "id"}})
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postCommentReportAction(Request $request, Comment $comment)
    {
        $viewer = $this->getUser();
        if (!$viewer || 'anon.' === $viewer || $viewer === $comment->getAuthor()) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        $report = (new Reporting())->setReporter($this->getUser())->setComment($comment);
        $form = $this->createForm(ReportingType::class, $report);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $this->get('doctrine.orm.entity_manager')->persist($report);
        $this->get('doctrine.orm.entity_manager')->flush();
        $this->get('Capco\AppBundle\Notifier\ReportNotifier')->onCreate($report);

        return $report;
    }
}
