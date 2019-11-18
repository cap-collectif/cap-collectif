<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Form\ReportingType;
use Capco\AppBundle\Notifier\ReportNotifier;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class ArgumentsController extends FOSRestController
{
    /**
     * @Post("/opinions/{opinionId}/arguments/{argumentId}/reports")
     * @Entity("opinion", options={"mapping": {"opinionId": "id"}})
     * @Entity("argument", options={"mapping": {"argumentId": "id"}})
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postOpinionArgumentReportAction(
        Request $request,
        Opinion $opinion,
        Argument $argument
    ) {
        $viewer = $this->getUser();
        if (!$viewer || 'anon.' === $viewer || $viewer === $argument->getAuthor()) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        if ($argument->getOpinion() !== $opinion) {
            throw new BadRequestHttpException('Not a child.');
        }

        return $this->createReport($request, $argument);
    }

    /**
     * @Post("/opinions/{opinionId}/versions/{versionId}/arguments/{argumentId}/reports")
     * @Entity("opinion", options={"mapping": {"opinionId": "id"}})
     * @Entity("version", options={"mapping": {"versionId": "id"}})
     * @Entity("argument", options={"mapping": {"argumentId": "id"}})
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postOpinionVersionArgumentReportAction(
        Request $request,
        Opinion $opinion,
        OpinionVersion $version,
        Argument $argument
    ) {
        $viewer = $this->getUser();
        if (!$viewer || 'anon.' === $viewer || $viewer === $argument->getAuthor()) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        if ($argument->getOpinionVersion() !== $version) {
            throw new BadRequestHttpException('Not a child.');
        }

        if ($opinion !== $version->getParent()) {
            throw new BadRequestHttpException('Not a child.');
        }

        return $this->createReport($request, $argument);
    }

    private function createReport(Request $request, Argument $argument)
    {
        $report = (new Reporting())->setReporter($this->getUser())->setArgument($argument);

        $form = $this->createForm(ReportingType::class, $report, ['csrf_protection' => false]);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $em = $this->getDoctrine()->getManager();
        $em->persist($report);
        $em->flush();
        $this->get(ReportNotifier::class)->onCreate($report);

        return $report;
    }
}
