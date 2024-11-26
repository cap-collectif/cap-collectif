<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Interfaces\FollowerNotifiedOfInterface;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Form\OpinionForm;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Requirement\StepRequirementsResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\ConsultationStepRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionTypeRepository;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;

class CreateOpinionMutation implements MutationInterface
{
    use MutationTrait;

    final public const OPINION_TYPE_NOT_ENABLED = 'OPINION_TYPE_NOT_ENABLED';
    final public const OPINION_TYPE_NOT_FOUND = 'OPINION_TYPE_NOT_FOUND';
    final public const PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND';
    final public const UNKNOWN_STEP = 'UNKNOWN_STEP';
    final public const STEP_NOT_CONTRIBUABLE = 'STEP_NOT_CONTRIBUABLE';
    final public const REQUIREMENTS_NOT_MET = 'REQUIREMENTS_NOT_MET';
    final public const CONTRIBUTED_TOO_MANY_TIMES = 'CONTRIBUTED_TOO_MANY_TIMES';
    final public const INVALID_FORM = 'INVALID_FORM';
    private readonly FormFactoryInterface $formFactory;
    private readonly EntityManagerInterface $em;
    private readonly ProjectRepository $projectRepository;
    private readonly OpinionTypeRepository $opinionTypeRepository;
    private readonly ConsultationStepRepository $consultationStepRepository;
    private readonly StepRequirementsResolver $stepRequirementsResolver;
    private readonly OpinionRepository $opinionRepository;
    private readonly Publisher $publisher;
    private readonly GlobalIdResolver $globalIdResolver;

    public function __construct(
        FormFactoryInterface $formFactory,
        EntityManagerInterface $em,
        ProjectRepository $projectRepository,
        OpinionTypeRepository $opinionTypeRepository,
        ConsultationStepRepository $consultationStepRepository,
        StepRequirementsResolver $stepRequirementsResolver,
        OpinionRepository $opinionRepository,
        Publisher $publisher,
        GlobalIdResolver $globalIdResolver
    ) {
        $this->formFactory = $formFactory;
        $this->em = $em;
        $this->projectRepository = $projectRepository;
        $this->opinionTypeRepository = $opinionTypeRepository;
        $this->consultationStepRepository = $consultationStepRepository;
        $this->stepRequirementsResolver = $stepRequirementsResolver;
        $this->opinionRepository = $opinionRepository;
        $this->publisher = $publisher;
        $this->globalIdResolver = $globalIdResolver;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $this->formatInput($input);
        $projectId = $input->offsetGet('projectId');
        $opinionTypeId = $input->offsetGet('opinionTypeId');
        $data = $input->getArrayCopy();

        $project = $this->projectRepository->find($projectId);
        $opinionType = $this->opinionTypeRepository->find($opinionTypeId);

        if (!$project) {
            return ['opinion' => null, 'errorCode' => self::PROJECT_NOT_FOUND];
        }

        if (!$opinionType) {
            return ['opinion' => null, 'errorCode' => self::OPINION_TYPE_NOT_FOUND];
        }

        return $this->createOpinion($project, $opinionType, $viewer, $data);
    }

    private function createOpinion(
        Project $project,
        OpinionType $type,
        User $viewer,
        array $data
    ): array {
        $stepId = $data['stepId'];
        unset($data['projectId'], $data['stepId'], $data['opinionTypeId']);

        if (!$type->getIsEnabled()) {
            return ['opinion' => null, 'errorCode' => self::OPINION_TYPE_NOT_ENABLED];
        }

        $step = $this->globalIdResolver->resolve($stepId, $viewer);

        if (!$step) {
            return ['opinion' => null, 'errorCode' => self::UNKNOWN_STEP];
        }

        if (!$step->canContribute($viewer)) {
            return ['opinion' => null, 'errorCode' => self::STEP_NOT_CONTRIBUABLE];
        }

        if (!$this->stepRequirementsResolver->viewerMeetsTheRequirementsResolver($viewer, $step)) {
            return ['opinion' => null, 'errorCode' => self::REQUIREMENTS_NOT_MET];
        }

        if (
            \count($this->opinionRepository->findCreatedSinceIntervalByAuthor($viewer, 'PT1M')) >= 2
        ) {
            return ['opinion' => null, 'errorCode' => self::CONTRIBUTED_TOO_MANY_TIMES];
        }

        $opinion = (new Opinion())
            ->setAuthor($viewer)
            ->setConsultation($type->getConsultation())
            ->setOpinionType($type)
        ;
        $form = $this->formFactory->create(OpinionForm::class, $opinion);
        $form->submit($data, false);

        if (!$form->isValid()) {
            return ['opinion' => null, 'errorCode' => self::INVALID_FORM];
        }

        if ($project->isOpinionCanBeFollowed()) {
            $follower = new Follower();
            $follower->setUser($viewer);
            $follower->setOpinion($opinion);
            $follower->setNotifiedOf(FollowerNotifiedOfInterface::ALL);
            $opinion->addFollower($follower);
        }

        $this->em->persist($opinion);
        $this->em->flush();

        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::OPINION_CREATE,
            new Message(json_encode(['opinionId' => $opinion->getId()]))
        );

        return ['opinion' => $opinion];
    }
}
