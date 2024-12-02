<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Form\ProjectAuthorTransformer;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
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
    use MutationTrait;

    public function __construct(private readonly EntityManagerInterface $em, private readonly LoggerInterface $logger, private readonly FormFactoryInterface $formFactory, private readonly ProjectAuthorTransformer $transformer, private readonly Publisher $publisher, private readonly GlobalIdResolver $globalIdResolver, private readonly AuthorizationCheckerInterface $authorizationChecker, private readonly ProjectAbstractStepRepository $projectAbstractStepRepository, private readonly TranslatorInterface $translator)
    {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $arguments = $input->getArrayCopy();

        $projectId = $input->offsetGet('projectId');
        $project = $this->getProject($projectId, $viewer);

        $this->setAuthors($arguments, $viewer, $project);
        $this->setRestrictedViewerGroups($arguments);
        $this->setDistricts($arguments, $project);
        $hasDescription = $this->handleDescription($arguments, $project);
        $this->handleSteps($arguments, $project, $viewer, $hasDescription);
        $this->handleProposalStepSplitView($arguments['isProposalStepSplitViewEnabled'], $project);

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

    public function handleSteps(&$arguments, Project $project, User $viewer, bool $hasDescription): void
    {
        $stepIds = array_map(function ($stepId) {
            return GlobalId::fromGlobalId($stepId)['id'] ?? $stepId;
        }, $arguments['steps']);

        $steps = $project->getRealSteps();
        // the deletion of the presentation step is handled in handleDescription method, so we can filter it here
        $oldStepsWithoutPresentationStep = array_filter($steps, fn (AbstractStep $step) => false === $step instanceof PresentationStep);

        $oldStepsId = array_map(fn (AbstractStep $step) => $step->getId(), $oldStepsWithoutPresentationStep);

        $stepIdsToDelete = array_diff($oldStepsId, $stepIds);

        foreach ($stepIdsToDelete as $stepId) {
            $projectAbstractStep = $this->projectAbstractStepRepository->findOneBy([
                'step' => $stepId,
            ]);
            $project->removeStep($projectAbstractStep);
        }

        foreach ($stepIds as $index => $stepId) {
            // if we have a description it means we have a presentation step in position 1, so we recompute the position starting at position 2 instead of 1
            $offset = $hasDescription ? 2 : 1;
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
            $projectAbstractStep->setPosition($index + $offset);
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
        if (ProjectVisibilityMode::VISIBILITY_CUSTOM !== $arguments['visibility']) {
            $arguments['restrictedViewerGroups'] = [];

            return;
        }

        if (empty($arguments['restrictedViewerGroups'])) {
            return;
        }

        $arguments['restrictedViewerGroups'] = array_map(function ($groupGlobalId) {
            return GlobalId::fromGlobalId($groupGlobalId)['id'];
        }, $arguments['restrictedViewerGroups']);
    }

    private function notifyOnNewProjectInDistrict(array $globalDistrictsId, Project $project): void
    {
        $globalDistrictsId = array_values($globalDistrictsId);
        foreach ($globalDistrictsId as $globalDistrict) {
            $this->publisher->publish(
                CapcoAppBundleMessagesTypes::PROJECT_DISTRICT_NOTIFICATION,
                new Message(
                    json_encode([
                        'globalDistrict' => $globalDistrict,
                        'projectId' => $project->getId(),
                    ])
                )
            );
        }
    }

    /**
     * @return bool Whether the project has a description
     */
    private function handleDescription(array &$arguments, Project $project): bool
    {
        if (false === \array_key_exists('description', $arguments)) {
            return false;
        }

        $description = $arguments['description'] ?? null;
        unset($arguments['description']);

        $presentationStep = $project->getFirstStep() instanceof PresentationStep ? $project->getFirstStep() : null;

        if (!$description && $presentationStep) {
            $project->removeStep($presentationStep->getProjectAbstractStep());

            return false;
        }

        $presentationStep ??= new PresentationStep();

        $title = $label = $this->translator->trans('presentation_step', [], 'CapcoAppBundle');
        $presentationStep->setBody($description);
        $presentationStep->setTitle($title);
        $presentationStep->setLabel($label);

        $projectAbstractStep = $presentationStep->getProjectAbstractStep() ?? new ProjectAbstractStep();
        $projectAbstractStep->setStep($presentationStep);
        $projectAbstractStep->setPosition(1);
        $presentationStep->setProjectAbstractStep($projectAbstractStep);
        $project->addStep($projectAbstractStep);

        return true;
    }

    private function handleProposalStepSplitView(?bool $isProposalStepSplitViewEnabled, Project $project): void
    {
        if (null === $isProposalStepSplitViewEnabled) {
            return;
        }

        $project->setIsProposalStepSplitViewEnabled($isProposalStepSplitViewEnabled);
    }
}
