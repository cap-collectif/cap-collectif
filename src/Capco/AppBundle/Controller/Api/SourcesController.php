<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Entity\SourceVote;
use Capco\AppBundle\Form\ReportingType;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Repository\SourceVoteRepository;
use Symfony\Component\HttpFoundation\Request;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\Delete;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class SourcesController extends FOSRestController
{
    /**
     * @Post("/sources/{sourceId}/votes")
     * @ParamConverter("source", options={"mapping": {"sourceId": "id"}})
     * @ParamConverter("vote", converter="fos_rest.request_body")
     * @View(statusCode=201, serializerGroups={})
     */
    public function postSourceVoteAction(
        Source $source,
        SourceVote $vote,
        ConstraintViolationListInterface $validationErrors
    ) {
        $viewer = $this->getUser();
        if (!$viewer || 'anon.' === $viewer) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        if (!$source->canContribute($viewer)) {
            throw new BadRequestHttpException('Uncontributable source.');
        }

        $em = $this->getDoctrine()->getManager();

        $previousVote = $this->get(SourceVoteRepository::class)->findOneBy([
            'user' => $viewer,
            'source' => $source,
        ]);

        if ($previousVote) {
            throw new BadRequestHttpException('Already voted.');
        }

        if ($validationErrors->count() > 0) {
            throw new BadRequestHttpException($validationErrors->__toString());
        }

        $vote->setSource($source)->setUser($viewer);
        $source->incrementVotesCount();
        $em->persist($vote);
        $em->flush();
        $this->get('redis_storage.helper')->recomputeUserCounters($viewer);
    }

    /**
     * @Delete("/sources/{sourceId}/votes")
     * @ParamConverter("source", options={"mapping": {"sourceId": "id"}})
     * @View()
     */
    public function deleteSourceVoteAction(Source $source)
    {
        $viewer = $this->getUser();
        if (!$viewer || 'anon.' === $viewer) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        if (!$source->canContribute($viewer)) {
            throw new BadRequestHttpException('Uncontributable source.');
        }

        $em = $this->getDoctrine()->getManager();

        $vote = $this->get(SourceVoteRepository::class)->findOneBy([
            'user' => $viewer,
            'source' => $source,
        ]);

        if (!$vote) {
            throw new BadRequestHttpException('You have not voted for this source.');
        }

        $source->decrementVotesCount();
        $em->remove($vote);
        $em->flush();
        $this->get('redis_storage.helper')->recomputeUserCounters($viewer);
    }

    /**
     * @Post("/opinions/{opinionId}/sources/{sourceId}/reports")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("source", options={"mapping": {"sourceId": "id"}})
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postOpinionSourceReportAction(
        Request $request,
        Opinion $opinion,
        Source $source
    ) {
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
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("version", options={"mapping": {"versionId": "id"}})
     * @ParamConverter("source", options={"mapping": {"sourceId": "id"}})
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postOpinionVersionSourceReportAction(
        Request $request,
        Opinion $opinion,
        OpinionVersion $version,
        Source $source
    ) {
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

        $this->get('capco.report_notifier')->onCreate($report);

        return $report;
    }
}
