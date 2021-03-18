<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Repository\ConsultationStepRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Notifier\ReportNotifier;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityNotFoundException;
use Swarrot\Broker\Message;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Form\OpinionForm;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Form\ReportingType;
use Symfony\Component\HttpFoundation\Request;
use FOS\RestBundle\Controller\Annotations\Put;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\View;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use FOS\RestBundle\Controller\AbstractFOSRestController;
use FOS\RestBundle\Controller\Annotations\Delete;
use Capco\AppBundle\Entity\Interfaces\FollowerNotifiedOfInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Capco\AppBundle\GraphQL\Resolver\Requirement\StepRequirementsResolver;
use Swarrot\SwarrotBundle\Broker\Publisher;

class OpinionsController extends AbstractFOSRestController
{
    private OpinionRepository $opinionRepository;
    private ConsultationStepRepository $consultationStepRepository;
    private GlobalIdResolver $globalIdResolver;
    private Publisher $publisher;
    private StepRequirementsResolver $requirementsResolver;
    private ReportNotifier $reportNotifier;
    private RedisStorageHelper $redisStorageHelper;

    public function __construct(
        OpinionRepository $opinionRepository,
        ConsultationStepRepository $consultationStepRepository,
        GlobalIdResolver $globalIdResolver,
        Publisher $publisher,
        StepRequirementsResolver $requirementsResolver,
        ReportNotifier $reportNotifier,
        RedisStorageHelper $redisStorageHelper
    ) {
        $this->opinionRepository = $opinionRepository;
        $this->consultationStepRepository = $consultationStepRepository;
        $this->globalIdResolver = $globalIdResolver;
        $this->publisher = $publisher;
        $this->requirementsResolver = $requirementsResolver;
        $this->reportNotifier = $reportNotifier;
        $this->redisStorageHelper = $redisStorageHelper;
    }

    /**
     *
     * @Post("/projects/{projectId}/steps/{stepId}/opinion_types/{typeId}/opinions")
     * @Entity("project", options={"mapping": {"projectId": "id"}})
     * @Entity("type", options={"mapping": {"typeId": "id"}})
     * @View(statusCode=201, serializerGroups={"Opinions", "UsersInfos", "UserMedias"})
     */
    public function postOpinionAction(
        Request $request,
        Project $project,
        string $stepId,
        OpinionType $type
    ) {
        /** @var User $viewer */
        $viewer = $this->getUser();
        if (!$viewer || 'anon.' === $viewer) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        if (!$type->getIsEnabled()) {
            throw new BadRequestHttpException('This opinionType is not enabled.');
        }

        $uuid = GlobalId::fromGlobalId($stepId)['id'];
        $step = $this->consultationStepRepository->find($uuid);

        if (!$step) {
            throw new BadRequestHttpException('Unknown step.');
        }

        /** @var User $author */
        $author = $this->getUser();

        if (!$step->canContribute($author)) {
            throw new BadRequestHttpException('This step is not contribuable.');
        }

        if (!$this->requirementsResolver->viewerMeetsTheRequirementsResolver($author, $step)) {
            throw new BadRequestHttpException('You dont meets all the requirements.');
        }

        if (
            \count($this->opinionRepository->findCreatedSinceIntervalByAuthor($author, 'PT1M')) >= 2
        ) {
            throw new BadRequestHttpException('You contributed too many times.');
        }

        $opinion = (new Opinion())
            ->setAuthor($author)
            ->setConsultation($type->getConsultation())
            ->setOpinionType($type);
        $form = $this->createForm(OpinionForm::class, $opinion);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        if ($project->isOpinionCanBeFollowed()) {
            $follower = new Follower();
            $follower->setUser($author);
            $follower->setOpinion($opinion);
            $follower->setNotifiedOf(FollowerNotifiedOfInterface::ALL);
            $opinion->addFollower($follower);
        }

        $em = $this->getDoctrine()->getManager();
        $em->persist($opinion);
        $em->flush();

        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::OPINION_CREATE,
            new Message(json_encode(['opinionId' => $opinion->getId()]))
        );

        return $opinion;
    }

    /**
     * @Put("/opinions/{id}")
     * @View(statusCode=200, serializerGroups={"Opinions", "UsersInfos", "UserMedias"})
     */
    public function putOpinionAction(Request $request, string $id)
    {
        /** @var User $viewer */
        $viewer = $this->getUser();
        $opinion = $this->opinionRepository->getOne(GlobalId::fromGlobalId($id)['id']);
        if (!$viewer || 'anon.' === $viewer || $viewer !== $opinion->getAuthor()) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        if (!$opinion->canContribute($this->getUser())) {
            throw new BadRequestHttpException('Uncontribuable opinion.');
        }

        $form = $this->createForm(OpinionForm::class, $opinion);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $opinion->resetVotes();
        $this->getDoctrine()
            ->getManager()
            ->flush();

        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::OPINION_UPDATE,
            new Message(json_encode(['opinionId' => $opinion->getId()]))
        );

        return $opinion;
    }

    /**
     * Delete an opinion.
     *
     * @Delete("/opinions/{opinionId}")
     * @View(statusCode=204, serializerGroups={})
     */
    public function deleteOpinionAction(Request $request, string $opinionId)
    {
        /** @var User $viewer */
        $viewer = $this->getUser();
        /** @var Opinion $opinion */
        $opinion = $this->globalIdResolver->resolve($opinionId, $viewer);
        if (!$viewer || 'anon.' === $viewer || $viewer !== $opinion->getAuthor()) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        $em = $this->getDoctrine()->getManager();
        $em->remove($opinion);
        $em->flush();
        $this->redisStorageHelper->recomputeUserCounters($viewer);
    }

    /**
     * @Post("/opinions/{opinionId}/reports")
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postOpinionReportAction(Request $request, string $opinionId)
    {
        /** @var User $viewer */
        $viewer = $this->getUser();
        /** @var Opinion $opinion */
        $opinion = $this->globalIdResolver->resolve($opinionId, $viewer);
        if (!$viewer || 'anon.' === $viewer || $viewer === $opinion->getAuthor()) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        $report = (new Reporting())->setReporter($viewer)->setOpinion($opinion);
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
        $this->reportNotifier->onCreate($report);

        return $report;
    }

    /**
     * @Post("/opinions/{opinionId}/versions/{versionId}/reports")
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postOpinionVersionReportAction(
        Request $request,
        string $opinionId,
        string $versionId
    ) {
        $viewer = $this->getUser();
        $opinionId = GlobalId::fromGlobalId($opinionId)['id'];
        $opinion = $this->opinionRepository->find($opinionId);
        if (!$opinion) {
            throw new EntityNotFoundException(
                `This opinion with id '${opinionId}' does not exist.`
            );
        }
        /** @var OpinionVersion $version */
        $version = $this->globalIdResolver->resolve($versionId, $viewer);
        if (!$viewer || 'anon.' === $viewer || $viewer === $version->getAuthor()) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        $report = (new Reporting())->setReporter($viewer)->setOpinionVersion($version);
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
        $this->reportNotifier->onCreate($report);

        return $report;
    }
}
