<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Repository\ConsultationStepRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Notifier\ReportNotifier;
use Swarrot\Broker\Message;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Form\OpinionForm;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Form\ReportingType;
use Capco\AppBundle\Entity\OpinionVersion;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
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

class OpinionsController extends AbstractFOSRestController
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
        $viewer = $this->getUser();
        if (!$viewer || 'anon.' === $viewer) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        if (!$type->getIsEnabled()) {
            throw new BadRequestHttpException('This opinionType is not enabled.');
        }

        $uuid = GlobalId::fromGlobalId($stepId)['id'];
        $step = $this->get(ConsultationStepRepository::class)->find($uuid);

        if (!$step) {
            throw new BadRequestHttpException('Unknown step.');
        }

        $author = $this->getUser();

        if (!$step->canContribute($author)) {
            throw new BadRequestHttpException('This step is not contribuable.');
        }

        $stepRequirementsResolver = $this->get(StepRequirementsResolver::class);

        if (!$stepRequirementsResolver->viewerMeetsTheRequirementsResolver($author, $step)) {
            throw new BadRequestHttpException('You dont meets all the requirements.');
        }

        $repo = $this->get(OpinionRepository::class);

        if (\count($repo->findCreatedSinceIntervalByAuthor($author, 'PT1M')) >= 2) {
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

        $this->get('swarrot.publisher')->publish(
            CapcoAppBundleMessagesTypes::OPINION_CREATE,
            new Message(json_encode(['opinionId' => $opinion->getId()]))
        );

        return $opinion;
    }

    /**
     * @Put("/opinions/{id}")
     * @Entity("opinion", options={
     *  "mapping": {"id": "id"},
     *  "repository_method": "getOne",
     *  "map_method_signature" = true
     * })
     * @View(statusCode=200, serializerGroups={"Opinions", "UsersInfos", "UserMedias"})
     */
    public function putOpinionAction(Request $request, Opinion $opinion)
    {
        $viewer = $this->getUser();
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
     * @Delete("/opinions/{opinionId}")
     * @Entity("opinion", options={"mapping": {"opinionId": "id"}})
     * @View(statusCode=204, serializerGroups={})
     */
    public function deleteOpinionAction(Request $request, Opinion $opinion)
    {
        $viewer = $this->getUser();
        if (!$viewer || 'anon.' === $viewer || $viewer !== $opinion->getAuthor()) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        $em = $this->getDoctrine()->getManager();
        $em->remove($opinion);
        $em->flush();
        $this->get(RedisStorageHelper::class)->recomputeUserCounters($viewer);
    }

    /**
     * @Post("/opinions/{opinionId}/reports")
     * @Entity("opinion", options={"mapping": {"opinionId": "id"}})
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postOpinionReportAction(Request $request, Opinion $opinion)
    {
        $viewer = $this->getUser();
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
        $this->get(ReportNotifier::class)->onCreate($report);

        return $report;
    }

    /**
     * @Post("/opinions/{opinionId}/versions/{versionId}/reports")
     * @Entity("version", options={"mapping": {"versionId": "id"}})
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postOpinionVersionReportAction(Request $request, OpinionVersion $version)
    {
        $viewer = $this->getUser();

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
        $this->get(ReportNotifier::class)->onCreate($report);

        return $report;
    }
}
