<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Form\ProjectAuthorTransformer;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\ProjectAbstractStepRepository;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\AlphaProjectFormType;
use Capco\UserBundle\Form\Type\ProjectAuthorsFormType;
use Doctrine\DBAL\Exception\DriverException;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class UpdateNewProjectMutation implements MutationInterface
{
    private EntityManagerInterface $em;
    private LoggerInterface $logger;
    private ProjectAuthorTransformer $transformer;
    private FormFactoryInterface $formFactory;
    private Publisher $publisher;
    private GlobalIdResolver $globalIdResolver;
    private AuthorizationCheckerInterface $authorizationChecker;
    private ProjectAbstractStepRepository $projectAbstractStepRepository;
    private TranslatorInterface $translator;
    private \HTMLPurifier $HTMLPurifier;

    public function __construct(
        EntityManagerInterface $em,
        LoggerInterface $logger,
        FormFactoryInterface $formFactory,
        ProjectAuthorTransformer $transformer,
        Publisher $publisher,
        GlobalIdResolver $globalIdResolver,
        AuthorizationCheckerInterface $authorizationChecker,
        ProjectAbstractStepRepository $projectAbstractStepRepository,
        TranslatorInterface $translator,
        \HTMLPurifier $HTMLPurifier
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->logger = $logger;
        $this->transformer = $transformer;
        $this->publisher = $publisher;
        $this->globalIdResolver = $globalIdResolver;
        $this->authorizationChecker = $authorizationChecker;
        $this->projectAbstractStepRepository = $projectAbstractStepRepository;
        $this->translator = $translator;
        $this->HTMLPurifier = $HTMLPurifier;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $arguments = $input->getArrayCopy();

        $projectId = $input->offsetGet('projectId');
        $project = $this->getProject($projectId, $viewer);

        $this->setAuthors($arguments, $viewer, $project);
        $this->setRestrictedViewerGroups($arguments);
        $this->setDistricts($arguments, $project);
        $this->handleSteps($arguments, $project, $viewer);
        $this->handleDescription($arguments, $project);

        if ($arguments['owner'] ?? null) {
            unset($arguments['owner']);
        }

        if ($arguments['projectId'] ?? null) {
            unset($arguments['projectId']);
        }

        $form = $this->formFactory->create(AlphaProjectFormType::class, $project);
        $form->submit($arguments, false);

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . $form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }

        try {
            $this->em->persist($project);
            $this->em->flush();
        } catch (DriverException $e) {
            $this->logger->error(
                __METHOD__ . ' => ' . $e->getErrorCode() . ' : ' . $e->getMessage()
            );

            throw new BadRequestHttpException('Sorry, please retry.');
        }

        return ['project' => $project];
    }

    public function getProject(string $projectId, User $viewer): Project
    {
        $project = $this->globalIdResolver->resolve($projectId, $viewer);
        if (!$project) {
            throw new UserError(sprintf('Unknown project "%d"', $projectId));
        }

        return $project;
    }

    public function setAuthors(array &$arguments, User $viewer, Project $project): void
    {
        if ($viewer->isOnlyProjectAdmin()) {
            $arguments['authors'] = [GlobalId::toGlobalId('User', $viewer->getId())];
        }

        $this->transformer->setProject($project);

        $form = $this->formFactory->create(ProjectAuthorsFormType::class, $project);

        $form->submit(
            ['authors' => $this->transformer->transformUsers($arguments['authors'])],
            false
        );

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . $form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }

        try {
            $this->em->flush();
        } catch (DriverException $e) {
            $this->logger->error(__METHOD__ . ' => ' . $e->getCode() . ' : ' . $e->getMessage());

            throw new BadRequestHttpException('Sorry, please retry.');
        }

        unset($arguments['authors']);
    }

    public function setDistricts(array &$arguments, Project $project): void
    {
        if (empty($arguments['districts'])) {
            return;
        }

        $previousDistricts = $project->getProjectDistrictPositionersIds();

        $arguments['districts'] = array_map(function ($districtGlobalId) {
            return GlobalId::fromGlobalId($districtGlobalId)['id'];
        }, $arguments['districts']);

        $newDistricts = array_diff($arguments['districts'], $previousDistricts);
        if ($newDistricts) {
            $this->notifyOnNewProjectInDistrict($newDistricts, $project);
        }
    }

    public function handleSteps(&$arguments, Project $project, User $viewer): void
    {
        $steps = $project->getRealSteps();
        // the deletion of the presentation step is handled in handleDescription method, so we can filter it here
        $oldStepsIdWithoutPresentationStep = array_filter($steps, function ($step) {
            return false === $step instanceof PresentationStep;
        });

        $oldStepsId = array_map(function ($step) {
            return $step->getId();
        }, $oldStepsIdWithoutPresentationStep);

        $stepsIdToDelete = array_diff($oldStepsId, $arguments['steps']);

        foreach ($stepsIdToDelete as $stepId) {
            $projectAbstractStep = $this->projectAbstractStepRepository->findOneBy([
                'step' => $stepId,
            ]);
            $project->removeStep($projectAbstractStep);
        }

        $stepIds = $arguments['steps'];
        foreach ($stepIds as $index => $stepId) {
            $step = $this->globalIdResolver->resolve($stepId, $viewer);
            $projectAbstractStep = $this->projectAbstractStepRepository->findOneBy([
                'project' => $project,
                'step' => $step,
            ]);
            if (!$projectAbstractStep) {
                $projectAbstractStep = (new ProjectAbstractStep())
                    ->setProject($project)
                    ->setStep($step)
                ;
                $this->em->persist($projectAbstractStep);
            }
            $projectAbstractStep->setPosition($index + 1);
            $project->addStep($projectAbstractStep);
        }

        unset($arguments['steps']);
    }

    public function isGranted(string $projectId, ?User $viewer): bool
    {
        $project = $this->getProject($projectId, $viewer);

        return $this->authorizationChecker->isGranted(ProjectVoter::EDIT, $project);
    }

    private function setRestrictedViewerGroups(array &$arguments): void
    {
        if (empty($arguments['restrictedViewerGroups'])) {
            return;
        }

        $arguments['restrictedViewerGroups'] = array_map(function ($groupGlobalId) {
            return GlobalId::fromGlobalId($groupGlobalId)['id'];
        }, $arguments['restrictedViewerGroups']);
    }

    private function notifyOnNewProjectInDistrict(array $projectDistrictsId, Project $project): void
    {
        $projectDistrictsId = array_values($projectDistrictsId);
        foreach ($projectDistrictsId as $projectDistrict) {
            $this->publisher->publish(
                CapcoAppBundleMessagesTypes::PROJECT_DISTRICT_NOTIFICATION,
                new Message(
                    json_encode([
                        'projectDistrict' => $projectDistrict,
                        'projectId' => $project->getId(),
                    ])
                )
            );
        }
    }

    private function handleDescription(array &$arguments, Project $project)
    {
        if (false === \array_key_exists('description', $arguments)) {
            return;
        }

        $description = $arguments['description'] ? $this->HTMLPurifier->purify($arguments['description']) : null;
        unset($arguments['description']);

        $steps = $project->getRealSteps();
        $abstractSteps = [];
        foreach ($steps as $step) {
            $abstractSteps[] = $step->getProjectAbstractStep();
        }
        $presentationStep = null;
        foreach ($steps as $step) {
            if ($step instanceof PresentationStep) {
                $presentationStep = $step;

                break;
            }
        }

        if ($presentationStep && !$description) {
            $project->removeStep($presentationStep->getProjectAbstractStep());

            return;
        }

        if ($presentationStep && $description) {
            $presentationStep->setBody($description);
            $presentationStep->getProjectAbstractStep()->setPosition(1);
            $this->recomputePositions($abstractSteps, 0);

            return;
        }

        if (!$description) {
            return;
        }

        $title = $this->translator->trans('presentation_step', [], 'CapcoAppBundle');
        $presentationStep = (new PresentationStep())
            ->setTitle($title)
            ->setLabel($title)
            ->setBody($description)
        ;
        $presentationProjectAbstractStep = (new ProjectAbstractStep())
            ->setStep($presentationStep)
            ->setProject($project)
            ->setPosition(1)
        ;

        $this->recomputePositions($abstractSteps, 1);

        $this->em->persist($presentationStep);
        $this->em->persist($presentationProjectAbstractStep);

        $project->addStep($presentationProjectAbstractStep);
    }

    private function recomputePositions(array $objects, int $offset = 0): array
    {
        foreach ($objects as $object) {
            $object->setPosition($object->getPosition() + $offset);
        }

        return $objects;
    }
}
