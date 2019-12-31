<?php

/** @noinspection PhpUnhandledExceptionInspection */

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Form\ReportingType;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Notifier\ReportNotifier;
use Capco\AppBundle\Repository\SourceRepository;
use Doctrine\ORM\EntityNotFoundException;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\HttpFoundation\Request;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\AbstractFOSRestController;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class SourcesController extends AbstractFOSRestController
{
    private $sourceRepository;

    public function __construct(SourceRepository $sourceRepository)
    {
        $this->sourceRepository = $sourceRepository;
    }

    /**
     * @Post("/opinions/{opinionId}/sources/{sourceId}/reports")
     * @Entity("opinion", options={"mapping": {"opinionId": "id"}})
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postOpinionSourceReportAction(Request $request, Opinion $opinion)
    {
        $source = $this->getSourceFromRequest($request);
        $viewer = $this->getUser();
        if (!$viewer || 'anon.' === $viewer) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        if ($viewer === $source->getAuthor()) {
            throw $this->createAccessDeniedException();
        }

        if ($source->getOpinion() !== $opinion) {
            throw new BadRequestHttpException('Not a child.');
        }

        return $this->createReport($request, $source);
    }

    /**
     * @Post("/opinions/{opinionId}/versions/{versionId}/sources/{sourceId}/reports")
     * @Entity("opinion", options={"mapping": {"opinionId": "id"}})
     * @Entity("version", options={"mapping": {"versionId": "id"}})
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postOpinionVersionSourceReportAction(
        Request $request,
        Opinion $opinion,
        OpinionVersion $version
    ) {
        $source = $this->getSourceFromRequest($request);
        $viewer = $this->getUser();
        if (!$viewer || 'anon.' === $viewer) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        if ($viewer === $source->getAuthor()) {
            throw $this->createAccessDeniedException();
        }

        if ($source->getOpinionVersion() !== $version) {
            throw new BadRequestHttpException('Not a child.');
        }

        return $this->createReport($request, $source);
    }

    private function createReport(Request $request, Source $source)
    {
        $report = (new Reporting())->setReporter($this->getUser())->setSource($source);
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

    private function getSourceFromRequest(Request $request): Source
    {
        $sourceId = GlobalId::fromGlobalId($request->get('sourceId'))['id'];
        /** @var Source $source */
        $source = $this->sourceRepository->find($sourceId);

        if (null === $source) {
            throw new EntityNotFoundException('This source does not exist.');
        }

        return $source;
    }
}
