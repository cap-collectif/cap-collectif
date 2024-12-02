<?php

namespace Capco\AppBundle\Form\Persister;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Form\ProjectAuthorTransformer;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Resolver\SettableOwnerResolver;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\AlphaProjectFormType;
use Capco\UserBundle\Form\Type\ProjectAuthorsFormType;
use Doctrine\DBAL\Exception\DriverException;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class ProjectPersister
{
    public function __construct(private readonly EntityManagerInterface $em, private readonly LoggerInterface $logger, private readonly FormFactoryInterface $formFactory, private readonly ProjectAuthorTransformer $transformer, private readonly ProjectStepPersister $stepPersister, private readonly ProjectRepository $repository, private readonly SettableOwnerResolver $settableOwnerResolver, private readonly Publisher $publisher)
    {
    }

    public function persist(Argument $input, User $viewer, ?bool $editMode = false): Project
    {
        $arguments = $input->getArrayCopy();

        if ($viewer->isOnlyProjectAdmin()) {
            $arguments['authors'] = [GlobalId::toGlobalId('User', $viewer->getId())];
        } elseif (\count($arguments['authors']) <= 0) {
            throw new UserError('You must specify at least one author.');
        }

        $project = (new Project())
            ->setOwner($this->settableOwnerResolver->__invoke($input->offsetGet('owner'), $viewer))
            ->setCreator($viewer)
        ;
        if (isset($arguments['owner'])) {
            unset($arguments['owner']);
        }
        if (!empty($arguments['restrictedViewerGroups'])) {
            $arguments = $this->getRestrictedViewerGroups($arguments);
        }

        if ($editMode) {
            $project = $this->getProject($arguments, $input->offsetGet('projectId'), $viewer);

            unset($arguments['projectId']);
        }
        $this->notifyOnNewProjectInDistrict($arguments, $project);

        $form = $this->formFactory->create(AlphaProjectFormType::class, $project);

        list($dataAuthors, $steps) = [$arguments['authors'], $arguments['steps']];
        unset($arguments['authors'], $arguments['steps']);
        $form->submit($arguments);

        if (!$editMode && $viewer->isOnlyProjectAdmin()) {
            // We force the project to restrict it's visibility when a project admin
            // create a new project, but this should only apply on creation
            $project->setVisibility(ProjectVisibilityMode::VISIBILITY_ME);
        }

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . (string) $form->getErrors(true, false));

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

        $this->transformer->setProject($project);

        $form = $this->formFactory->create(ProjectAuthorsFormType::class, $project);

        $form->submit(['authors' => $this->transformer->transformUsers($dataAuthors)], false);

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . (string) $form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }

        try {
            $this->em->flush();
            $this->stepPersister->persist($project, $steps, $viewer);
        } catch (DriverException $e) {
            $this->logger->error(__METHOD__ . ' => ' . $e->getCode() . ' : ' . $e->getMessage());

            throw new BadRequestHttpException('Sorry, please retry.');
        }

        return $project;
    }

    private function getRestrictedViewerGroups($arguments)
    {
        $arguments['restrictedViewerGroups'] = array_map(
            fn ($groupGlobalId) => GlobalId::fromGlobalId($groupGlobalId)['id'],
            $arguments['restrictedViewerGroups']
        );

        return $arguments;
    }

    private function getProject(array &$arguments, string $projectId, User $viewer): Project
    {
        $projectId = GlobalId::fromGlobalId($projectId)['id'];
        $project = $this->repository->find($projectId);
        if (!$project) {
            throw new UserError(sprintf('Unknown project "%d"', $projectId));
        }
        if (
            ProjectVisibilityMode::VISIBILITY_ADMIN === $arguments['visibility']
            && $viewer->isOnlyProjectAdmin()
        ) {
            throw new UserError('Access denied to this field.');
        }

        return $project;
    }

    private function notifyOnNewProjectInDistrict(array &$arguments, Project $project): void
    {
        $previousDistricts = $project->getProjectDistrictPositionersIds();

        if (!empty($arguments['districts'])) {
            $arguments['districts'] = array_map(
                fn ($districtGlobalId) => GlobalId::fromGlobalId($districtGlobalId)['id'],
                $arguments['districts']
            );
        }

        $newDistricts = array_diff($arguments['districts'], $previousDistricts);

        if ($newDistricts) {
            foreach ($newDistricts as $id) {
                $this->publisher->publish(
                    CapcoAppBundleMessagesTypes::PROJECT_DISTRICT_NOTIFICATION,
                    new Message(
                        json_encode([
                            'globalDistrict' => $id,
                            'projectId' => $project->getId(),
                        ])
                    )
                );
            }
        }
    }
}
