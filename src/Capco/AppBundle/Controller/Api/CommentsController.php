<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Form\ReportingType;
use Capco\AppBundle\Notifier\ReportNotifier;
use Capco\AppBundle\Repository\CommentRepository;
use Doctrine\ORM\EntityManagerInterface;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\AbstractFOSRestController;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class CommentsController extends AbstractFOSRestController
{
    private $commentRepository;
    private $entityManager;
    private $reportNotifier;

    public function __construct(
        CommentRepository $commentRepository,
        EntityManagerInterface $entityManager,
        ReportNotifier $reportNotifier
    ) {
        $this->commentRepository = $commentRepository;
        $this->entityManager = $entityManager;
        $this->reportNotifier = $reportNotifier;
    }

    /**
     * @Post("/comments/{commentId}/reports")
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postCommentReportAction(Request $request, string $commentId)
    {
        $viewer = $this->getUser();
        $comment = $this->commentRepository->find(GlobalId::fromGlobalId($commentId)['id']);
        if (!$viewer || 'anon.' === $viewer || $viewer === $comment->getAuthor()) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        $report = (new Reporting())->setReporter($this->getUser())->setComment($comment);
        $form = $this->createForm(ReportingType::class, $report);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $this->entityManager->persist($report);
        $this->entityManager->flush();
        $this->reportNotifier->onCreate($report);

        return $report;
    }
}
