<?php
namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\OpinionVersionVote;
use Capco\AppBundle\Entity\OpinionVote;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Form\OpinionForm;
use Capco\AppBundle\Form\OpinionVersionType;
use Capco\AppBundle\Form\ReportingType;
use Doctrine\DBAL\Exception\DriverException;
use FOS\RestBundle\Controller\Annotations\Delete;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\Put;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Request\ParamFetcherInterface;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Swarrot\Broker\Message;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Validator\ConstraintViolationListInterface;

class OpinionsController extends FOSRestController
{
    /**
     * @ApiDoc(
     *  resource=true,
     *  description="Create an opinion.",
     *  statusCodes={
     *    201 = "Returned when successful",
     *    404 = "Returned when opinion not found",
     *  }
     * )
     *
     * @Post("/projects/{projectId}/steps/{stepId}/opinion_types/{typeId}/opinions")
     * @ParamConverter("project", options={"mapping": {"projectId": "id"}})
     * @ParamConverter("step", options={"mapping": {"stepId": "id"}})
     * @ParamConverter("type", options={"mapping": {"typeId": "id"}})
     * @Security("has_role('ROLE_USER')")
     * @View(statusCode=201, serializerGroups={})
     */
    public function postOpinionAction(
        Request $request,
        Project $project,
        ConsultationStep $step,
        OpinionType $type
    ) {
        if (!$step->canContribute()) {
            throw new BadRequestHttpException('This step is not contribuable.');
        }

        if (!$type->getIsEnabled()) {
            throw new BadRequestHttpException('This opinionType is not enabled.');
        }

        $author = $this->getUser();
        $repo = $this->get('capco.opinion.repository');

        if (\count($repo->findCreatedSinceIntervalByAuthor($author, 'PT1M')) >= 2) {
            throw new BadRequestHttpException('You contributed too many times.');
        }

        $opinion = (new Opinion())
            ->setAuthor($author)
            ->setStep($step)
            ->setIsEnabled(true)
            ->setOpinionType($type);
        $form = $this->createForm(OpinionForm::class, $opinion);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $em = $this->getDoctrine()->getManager();
        $em->persist($opinion);
        $em->flush();

        $this->get('swarrot.publisher')->publish(
            CapcoAppBundleMessagesTypes::OPINION_CREATE,
            new Message(json_encode(['opinionId' => $opinion->getId()]))
        );

        return $opinion;
    }

    /**
     * @Put("/opinions/{id}")
     * @ParamConverter("opinion", options={
     *  "mapping": {"id": "id"},
     *  "repository_method": "getOne",
     *  "map_method_signature" = true
     * })
     * @Security("has_role('ROLE_USER')")
     * @View(statusCode=200, serializerGroups={"Opinions", "UsersInfos", "UserMedias"})
     */
    public function putOpinionAction(Request $request, Opinion $opinion)
    {
        if ($this->getUser() !== $opinion->getAuthor()) {
            throw new AccessDeniedHttpException();
        }

        if (!$opinion->canContribute()) {
            throw new BadRequestHttpException('Uncontribuable opinion.');
        }

        $form = $this->createForm(OpinionForm::class, $opinion);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $opinion->resetVotes();
        $opinion->setValidated(false);
        $this->getDoctrine()
            ->getManager()
            ->flush();

        $this->get('swarrot.publisher')->publish(
            CapcoAppBundleMessagesTypes::OPINION_UPDATE,
            new Message(json_encode(['opinionId' => $opinion->getId()]))
        );

        return $opinion;
    }

    /**
     * Delete an opinion.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Delete an opinion",
     *  statusCodes={
     *    204 = "Returned when successful",
     *    403 = "Returned when requesting user is not the opinion's author",
     *    400 = "Returned when delete fail",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Delete("/opinions/{opinionId}")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @View(statusCode=204, serializerGroups={})
     */
    public function deleteOpinionAction(Request $request, Opinion $opinion)
    {
        $user = $this->getUser();
        if ($user !== $opinion->getAuthor()) {
            throw new AccessDeniedException();
        }

        $em = $this->getDoctrine()->getManager();
        $em->remove($opinion);
        $em->flush();
        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());
    }

    /**
     * Vote on an opinion.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Vote on an opinion",
     *  statusCodes={
     *    204 = "Returned when successful",
     *    400 = "Returned when opinion is not contribuable",
     *    404 = "Returned when opinion is not found",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Put("/opinions/{id}/votes")
     * @ParamConverter("opinion", options={"mapping": {"id": "id"}})
     * @ParamConverter("vote", converter="fos_rest.request_body")
     * @View(statusCode=200, serializerGroups={"Opinions", "UsersInfos", "UserMedias"})
     */
    public function putOpinionVoteAction(
        Opinion $opinion,
        OpinionVote $vote,
        ConstraintViolationListInterface $validationErrors
    ) {
        if (!$opinion->canContribute()) {
            throw new BadRequestHttpException('Uncontribuable opinion.');
        }

        if ($validationErrors->count() > 0) {
            throw new BadRequestHttpException($validationErrors->__toString());
        }

        $user = $this->getUser();
        $previousVote = $this->getDoctrine()
            ->getRepository('CapcoAppBundle:OpinionVote')
            ->findOneBy(['user' => $user, 'opinion' => $opinion]);

        if ($previousVote) {
            $opinion->incrementVotesCountByType($vote->getValue());
            $opinion->decrementVotesCountByType($previousVote->getValue());

            $previousVote->setValue($vote->getValue());
            $this->getDoctrine()
                ->getManager()
                ->flush();

            return $previousVote;
        }

        $vote->setOpinion($opinion)->setUser($user);
        $opinion->incrementVotesCountByType($vote->getValue());

        try {
            $this->getDoctrine()
                ->getManager()
                ->persist($vote);
            $this->getDoctrine()
                ->getManager()
                ->flush();
        } catch (DriverException $e) {
            // Updating opinion votes count failed
            throw new BadRequestHttpException('Sorry, please retry.');
        }

        return $vote;
    }

    /**
     * Delete a vote on an opinion.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Delete a vote on an opinion",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    400 = "Returned when opinion is not contribuable or user has no vote in the opinion",
     *    404 = "Returned when opinion not found",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Delete("/opinions/{id}/votes")
     * @ParamConverter("opinion", options={"mapping": {"id": "id"}})
     * @View(statusCode=200, serializerGroups={"Opinions", "UsersInfos", "UserMedias"})
     */
    public function deleteOpinionVoteAction(Opinion $opinion)
    {
        if (!$opinion->canContribute()) {
            throw new BadRequestHttpException('Uncontribuable opinion.');
        }

        $vote = $this->getDoctrine()
            ->getManager()
            ->getRepository('CapcoAppBundle:OpinionVote')
            ->findOneBy(['user' => $this->getUser(), 'opinion' => $opinion]);

        if (!$vote) {
            throw new BadRequestHttpException('You have not voted for this opinion.');
        }

        $opinion->decrementVotesCountByType($vote->getValue());
        $this->getDoctrine()
            ->getManager()
            ->remove($vote);
        $this->getDoctrine()
            ->getManager()
            ->flush();
        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());

        return $vote;
    }

    /**
     * Put a vote for an opinion version.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Put a vote for an opinion version.",
     *  statusCodes={
     *    204 = "Returned when successful",
     *    404 = "Returned when opinion or opinion version not found",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Put("/opinions/{opinionId}/versions/{versionId}/votes")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("version", options={"mapping": {"versionId": "id"}})
     * @ParamConverter("vote", converter="fos_rest.request_body")
     * @View(statusCode=200, serializerGroups={"OpinionVersions", "UsersInfos", "UserMedias"})
     */
    public function putOpinionVersionVoteAction(
        Opinion $opinion,
        OpinionVersion $version,
        OpinionVersionVote $vote,
        ConstraintViolationListInterface $validationErrors
    ) {
        if (!$opinion->canContribute()) {
            throw new BadRequestHttpException("Can't add a vote to an uncontributable opinion.");
        }

        if (!$opinion->getOpinionType()->isVersionable()) {
            throw new BadRequestHttpException("Can't add a version to an unversionable opinion.");
        }

        if ($validationErrors->count() > 0) {
            throw new BadRequestHttpException($validationErrors->__toString());
        }

        $user = $this->getUser();
        $previousVote = $this->getDoctrine()
            ->getManager()
            ->getRepository('CapcoAppBundle:OpinionVersionVote')
            ->findOneBy(['user' => $user, 'opinionVersion' => $version]);

        if ($previousVote) {
            $version->incrementVotesCountByType($vote->getValue());
            $version->decrementVotesCountByType($previousVote->getValue());

            $previousVote->setValue($vote->getValue());
            $this->getDoctrine()
                ->getManager()
                ->flush();

            return $previousVote;
        }

        $vote->setOpinionVersion($version)->setUser($user);
        $version->incrementVotesCountByType($vote->getValue());
        $this->getDoctrine()
            ->getManager()
            ->persist($vote);
        $this->getDoctrine()
            ->getManager()
            ->flush();

        return $vote;
    }

    /**
     * Delete a vote from an opinion version.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Delete a vote from an opinion version.",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when opinion or opinion version not found",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Delete("/opinions/{opinionId}/versions/{versionId}/votes")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("version", options={"mapping": {"versionId": "id"}})
     * @View(statusCode=200, serializerGroups={"OpinionVersions", "UsersInfos", "UserMedias"})
     */
    public function deleteOpinionVersionVoteAction(Opinion $opinion, OpinionVersion $version)
    {
        if (!$opinion->canContribute()) {
            throw new BadRequestHttpException('Uncontributable opinion.');
        }

        if (!$opinion->getOpinionType()->isVersionable()) {
            throw new BadRequestHttpException('Unversionable opinion.');
        }

        $vote = $this->getDoctrine()
            ->getManager()
            ->getRepository('CapcoAppBundle:OpinionVersionVote')
            ->findOneBy(['user' => $this->getUser(), 'opinionVersion' => $version]);

        if (!$vote) {
            throw new BadRequestHttpException('You have not voted for this opinion version.');
        }

        $version->decrementVotesCountByType($vote->getValue());
        $this->getDoctrine()
            ->getManager()
            ->remove($vote);
        $this->getDoctrine()
            ->getManager()
            ->flush();
        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());

        return $vote;
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Post("/opinions/{opinionId}/reports")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postOpinionReportAction(Request $request, Opinion $opinion)
    {
        if ($this->getUser() === $opinion->getAuthor()) {
            throw $this->createAccessDeniedException();
        }

        $report = (new Reporting())->setReporter($this->getUser())->setOpinion($opinion);
        $form = $this->createForm(ReportingType::class, $report, ['csrf_protection' => false]);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $this->getDoctrine()
            ->getManager()
            ->persist($report);
        $this->getDoctrine()
            ->getManager()
            ->flush();
        $this->get('capco.report_notifier')->onCreate($report);

        return $report;
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Post("/versions/{versionId}/reports")
     * @ParamConverter("version", options={"mapping": {"versionId": "id"}})
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postOpinionVersionReportAction(Request $request, OpinionVersion $version)
    {
        if ($this->getUser() === $version->getAuthor()) {
            throw $this->createAccessDeniedException();
        }

        $report = (new Reporting())->setReporter($this->getUser())->setOpinionVersion($version);
        $form = $this->createForm(ReportingType::class, $report, ['csrf_protection' => false]);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $this->getDoctrine()
            ->getManager()
            ->persist($report);
        $this->getDoctrine()
            ->getManager()
            ->flush();
        $this->get('capco.report_notifier')->onCreate($report);

        return $report;
    }
}
