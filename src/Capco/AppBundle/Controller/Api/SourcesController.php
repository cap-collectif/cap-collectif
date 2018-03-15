<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\SourceVote;
use Capco\AppBundle\Form\ApiSourceType as SourceType;
use Capco\AppBundle\Form\ReportingType;
use FOS\RestBundle\Controller\Annotations\Delete;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\Put;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Validator\ConstraintViolationListInterface;

class SourcesController extends FOSRestController
{
    /**
     * @Post("/opinions/{id}/sources")
     * @ParamConverter("opinion", options={"mapping": {"id": "id"}, "repository_method": "getOne", "map_method_signature" = true})
     * @Security("has_role('ROLE_USER')")
     * @View(statusCode=201)
     */
    public function postOpinionSourceAction(Request $request, Opinion $opinion)
    {
        if (!$opinion->canContribute()) {
            throw new BadRequestHttpException("Can't add a source to an uncontributable opinion.");
        }

        if (!$opinion->getOpinionType()->isSourceable()) {
            throw new BadRequestHttpException('Not sourceable.');
        }

        $source = (new Source())
            ->setType(Source::LINK)
            ->setOpinion($opinion)
            ->setIsEnabled(true)
            ->setUpdatedAt(new \Datetime())
            ->setAuthor($this->getUser())
        ;

        $form = $this->createForm(new SourceType(), $source);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $opinion->incrementSourcesCount();

        $em = $this->getDoctrine()->getManager();

        $em->persist($source);
        $em->flush();
        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());

        return $source;
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Post("/opinions/{opinionId}/versions/{versionId}/sources")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("version", options={"mapping": {"versionId": "id"}})
     * @View(statusCode=201, serializerGroups={})
     */
    public function postOpinionVersionSourceAction(Request $request, Opinion $opinion, OpinionVersion $version)
    {
        if ($opinion !== $version->getParent()) {
            throw new BadRequestHttpException('Not a child.');
        }

        if (!$version->canContribute()) {
            throw new BadRequestHttpException("Can't add a source to an uncontributable version.");
        }

        if (!$version->getOpinionType()->isSourceable()) {
            throw new BadRequestHttpException("Can't add a source to an unsourceable version.");
        }

        $source = (new Source())
                    ->setAuthor($this->getUser())
                    ->setType(Source::LINK)
                    ->setOpinionVersion($version)
                    ->setIsEnabled(true)
                    ->setUpdatedAt(new \Datetime())
                ;

        $form = $this->createForm(new SourceType(), $source);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $version->incrementSourcesCount();

        $em = $this->getDoctrine()->getManager();

        $em->persist($source);
        $em->flush();
        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());

        return $source;
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Put("/opinions/{opinionId}/sources/{sourceId}")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("source", options={"mapping": {"sourceId": "id"}})
     * @View(statusCode=200, serializerGroups={})
     */
    public function putOpinionSourceAction(Request $request, Opinion $opinion, Source $source)
    {
        if ($this->getUser() !== $source->getAuthor()) {
            throw $this->createAccessDeniedException();
        }

        if ($source->getOpinion() !== $opinion) {
            throw new BadRequestHttpException('Not a child.');
        }

        if (!$opinion->canContribute()) {
            throw new BadRequestHttpException("Can't update a source of an uncontributable opinion.");
        }

        $form = $this->createForm(new SourceType(), $source);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $source->resetVotes();

        $em = $this->getDoctrine()->getManager();

        $em->persist($source);
        $em->flush();

        return $source;
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Put("/opinions/{opinionId}/versions/{versionId}/sources/{sourceId}")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("version", options={"mapping": {"versionId": "id"}})
     * @ParamConverter("source", options={"mapping": {"sourceId": "id"}})
     * @View(statusCode=200, serializerGroups={})
     */
    public function putOpinionVersionSourceAction(Request $request, Opinion $opinion, OpinionVersion $version, Source $source)
    {
        if ($this->getUser() !== $source->getAuthor()) {
            throw $this->createAccessDeniedException();
        }

        if ($source->getOpinionVersion() !== $version) {
            throw new BadRequestHttpException('Not a child.');
        }

        if ($opinion !== $version->getParent()) {
            throw new BadRequestHttpException('Not a child.');
        }

        if (!$version->canContribute()) {
            throw new BadRequestHttpException("Can't update a source to an uncontributable version.");
        }

        if (!$version->getOpinionType()->isSourceable()) {
            throw new BadRequestHttpException("Can't update a source to an unsourceable version.");
        }

        $form = $this->createForm(new SourceType(), $source);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $source->resetVotes();

        $em = $this->getDoctrine()->getManager();

        $em->persist($source);
        $em->flush();

        return $source;
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Post("/sources/{sourceId}/votes")
     * @ParamConverter("source", options={"mapping": {"sourceId": "id"}})
     * @ParamConverter("vote", converter="fos_rest.request_body")
     * @View(statusCode=201, serializerGroups={})
     */
    public function postSourceVoteAction(Source $source, SourceVote $vote, ConstraintViolationListInterface $validationErrors)
    {
        if (!$source->canContribute()) {
            throw new BadRequestHttpException('Uncontributable source.');
        }

        $user = $this->getUser();
        $em = $this->getDoctrine()->getManager();

        $previousVote = $em->getRepository('CapcoAppBundle:SourceVote')
                           ->findOneBy(['user' => $user, 'source' => $source]);

        if ($previousVote) {
            throw new BadRequestHttpException('Already voted.');
        }

        if ($validationErrors->count() > 0) {
            throw new BadRequestHttpException($validationErrors->__toString());
        }

        $vote
            ->setSource($source)
            ->setUser($user)
        ;

        $source->incrementVotesCount();
        $em->persist($vote);
        $em->flush();
        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Delete("/opinions/{opinionId}/sources/{sourceId}")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("source", options={"mapping": {"sourceId": "id"}})
     * @View()
     */
    public function deleteOpinionSourceAction(Opinion $opinion, Source $source)
    {
        if ($this->getUser() !== $source->getAuthor()) {
            throw $this->createAccessDeniedException();
        }

        if ($source->getOpinion() !== $opinion) {
            throw new BadRequestHttpException('Not a child.');
        }

        if (!$source->canContribute()) {
            throw new BadRequestHttpException('Uncontributable source.');
        }

        $opinion->decrementSourcesCount();
        $em = $this->getDoctrine()->getManager();
        $em->remove($source);
        $em->flush();
        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Delete("/opinions/{opinionId}/versions/{versionId}/sources/{sourceId}")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("version", options={"mapping": {"versionId": "id"}})
     * @ParamConverter("source", options={"mapping": {"sourceId": "id"}})
     * @View()
     */
    public function deleteOpinionVersionSourceAction(Opinion $opinion, OpinionVersion $version, Source $source)
    {
        if ($this->getUser() !== $source->getAuthor()) {
            throw $this->createAccessDeniedException();
        }

        if ($source->getOpinionVersion() !== $version) {
            throw new BadRequestHttpException('Not a child.');
        }

        if ($opinion !== $version->getParent()) {
            throw new BadRequestHttpException('Not a child.');
        }

        if (!$source->canContribute()) {
            throw new BadRequestHttpException('Uncontributable source.');
        }

        $version->decrementSourcesCount();
        $em = $this->getDoctrine()->getManager();
        $em->remove($source);
        $em->flush();
        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Delete("/sources/{sourceId}/votes")
     * @ParamConverter("source", options={"mapping": {"sourceId": "id"}})
     * @View()
     */
    public function deleteSourceVoteAction(Source $source)
    {
        if (!$source->canContribute()) {
            throw new BadRequestHttpException('Uncontributable source.');
        }

        $em = $this->getDoctrine()->getManager();

        $vote = $em->getRepository('CapcoAppBundle:SourceVote')
                   ->findOneBy([
                        'user' => $this->getUser(),
                        'source' => $source,
                    ]);

        if (!$vote) {
            throw new BadRequestHttpException('You have not voted for this source.');
        }

        $source->decrementVotesCount();
        $em->remove($vote);
        $em->flush();
        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Post("/opinions/{opinionId}/sources/{sourceId}/reports")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("source", options={"mapping": {"sourceId": "id"}})
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postOpinionSourceReportAction(Request $request, Opinion $opinion, Source $source)
    {
        if ($this->getUser() === $source->getAuthor()) {
            throw $this->createAccessDeniedException();
        }

        if ($source->getOpinion() !== $opinion) {
            throw new BadRequestHttpException('Not a child.');
        }

        return $this->createReport($request, $source);
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Post("/opinions/{opinionId}/versions/{versionId}/sources/{sourceId}/reports")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("version", options={"mapping": {"versionId": "id"}})
     * @ParamConverter("source", options={"mapping": {"sourceId": "id"}})
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postOpinionVersionSourceReportAction(Request $request, Opinion $opinion, OpinionVersion $version, Source $source)
    {
        if ($this->getUser() === $source->getAuthor()) {
            throw $this->createAccessDeniedException();
        }

        if ($source->getOpinionVersion() !== $version) {
            throw new BadRequestHttpException('Not a child.');
        }

        return $this->createReport($request, $source);
    }

    private function createReport(Request $request, Source $source)
    {
        $report = (new Reporting())
                    ->setReporter($this->getUser())
                    ->setSource($source)
                ;

        $form = $this->createForm(new ReportingType(), $report, ['csrf_protection' => false]);
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
