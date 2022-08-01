<?php

namespace Capco\AppBundle\Form\Persister;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Interfaces\Owner;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Form\ProjectAuthorTransformer;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Security\CanSetOwner;
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
    private EntityManagerInterface $em;
    private LoggerInterface $logger;
    private ProjectAuthorTransformer $transformer;
    private FormFactoryInterface $formFactory;
    private ProjectStepPersister $stepPersister;
    private ProjectRepository $repository;
    private GlobalIdResolver $resolver;
    private Publisher $publisher;

    public function __construct(
        EntityManagerInterface $em,
        LoggerInterface $logger,
        FormFactoryInterface $formFactory,
        ProjectAuthorTransformer $transformer,
        ProjectStepPersister $stepPersister,
        ProjectRepository $repository,
        GlobalIdResolver $resolver,
        Publisher $publisher
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->logger = $logger;
        $this->stepPersister = $stepPersister;
        $this->transformer = $transformer;
        $this->repository = $repository;
        $this->resolver = $resolver;
        $this->publisher = $publisher;
    }

    public function persist(Argument $input, User $viewer, ?bool $editMode = false): Project
    {
        $arguments = $input->getArrayCopy();

        if ($viewer->isOnlyProjectAdmin()) {
            $arguments['authors'] = [GlobalId::toGlobalId('User', $viewer->getId())];
        } elseif (\count($arguments['authors']) <= 0) {
            throw new UserError('You must specify at least one author.');
        }

        $project = (new Project())->setOwner($this->getOwner($input, $viewer))->setCreator($viewer);
        if (isset($arguments['owner'])) {
            unset($arguments['owner']);
        }
        $previousDistricts = [];
        if (!empty($arguments['restrictedViewerGroups'])) {
            $arguments['restrictedViewerGroups'] = array_map(function ($groupGlobalId) {
                return GlobalId::fromGlobalId($groupGlobalId)['id'];
            }, $arguments['restrictedViewerGroups']);
        }

        if ($editMode) {
            $projectId = GlobalId::fromGlobalId($input->offsetGet('projectId'))['id'];
            $project = $this->repository->find($projectId);
            if (!$project instanceof Project) {
                throw new UserError(sprintf('Unknown project "%d"', $projectId));
            }
            if (
                ProjectVisibilityMode::VISIBILITY_ADMIN === $arguments['visibility'] &&
                $viewer->isOnlyProjectAdmin()
            ) {
                throw new UserError('Access denied to this field.');
            }

            unset($arguments['projectId']);
            $previousDistricts = $project->getProjectDistrictPositionersIds();
        }

        if (!empty($arguments['districts'])) {
            $arguments['districts'] = array_map(function ($districtGlobalId) {
                return GlobalId::fromGlobalId($districtGlobalId)['id'];
            }, $arguments['districts']);
        }
        $newDistricts = array_diff($arguments['districts'], $previousDistricts);
        if ($newDistricts) {
            $this->notifyOnNewProjectInDistrict($newDistricts, $project);
        }

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

    private function getOwner(Argument $input, User $viewer): Owner
    {
        if ($input->offsetGet('owner')) {
            $owner = $this->resolver->resolve($input->offsetGet('owner'), $viewer);
            if ($owner && CanSetOwner::check($owner, $viewer)) {
                return $owner;
            }
        }

        return $viewer;
    }
}
