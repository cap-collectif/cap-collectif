<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Repository\ConsultationStepRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Notifier\ReportNotifier;
use Capco\UserBundle\Entity\User;
use Swarrot\Broker\Message;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Form\OpinionForm;
use Capco\AppBundle\Entity\OpinionType;
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
}
