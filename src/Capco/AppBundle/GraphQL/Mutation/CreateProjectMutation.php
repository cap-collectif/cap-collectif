<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProjectTab;
use Capco\AppBundle\Entity\ProjectTabEvents;
use Capco\AppBundle\Entity\ProjectTabNews;
use Capco\AppBundle\Entity\ProjectTabPresentation;
use Capco\AppBundle\Enum\LogActionType;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Form\ProjectAuthorTransformer;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Logger\ActionLogger;
use Capco\AppBundle\Resolver\SettableOwnerResolver;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\ProjectAuthorsFormType;
use Capco\UserBundle\Form\Type\ProjectFormType;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\DBAL\Driver\DriverException;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Component\String\Slugger\SluggerInterface;

class CreateProjectMutation implements MutationInterface
{
    use MutationTrait;

    private const DEFAULT_TABS = [
        ['title' => 'Présentation', 'position' => 1, 'class' => ProjectTabPresentation::class],
        ['title' => 'Actualités', 'position' => 2, 'class' => ProjectTabNews::class],
        ['title' => 'Événements', 'position' => 3, 'class' => ProjectTabEvents::class],
    ];

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly LoggerInterface $logger,
        private readonly FormFactoryInterface $formFactory,
        private readonly SettableOwnerResolver $settableOwnerResolver,
        private readonly ProjectAuthorTransformer $transformer,
        private readonly AuthorizationCheckerInterface $authorizationChecker,
        private readonly Indexer $indexer,
        private readonly ActionLogger $actionLogger,
        private readonly SluggerInterface $slugger
    ) {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $arguments = $input->getArrayCopy();

        if ($viewer->isOnlyProjectAdmin()) {
            $arguments['authors'] = [GlobalId::toGlobalId('User', $viewer->getId())];
        } elseif (\count($arguments['authors']) <= 0) {
            throw new UserError('You must specify at least one author.');
        }

        $project = (new Project())->setCreator($viewer);
        $project->setOwner(
            $this->settableOwnerResolver->__invoke($input->offsetGet('owner'), $viewer)
        );

        if (isset($arguments['owner'])) {
            unset($arguments['owner']);
        }
        $owner = $project->getOwner();
        if ($viewer->isOnlyProjectAdmin() || $owner instanceof Organization) {
            $project->setVisibility(ProjectVisibilityMode::VISIBILITY_ME);
        }

        $form = $this->formFactory->create(ProjectFormType::class, $project);

        $dataAuthors = $arguments['authors'];
        unset($arguments['authors']);

        $form->submit($arguments, false);
        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . (string) $form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }

        $this->createDefaultTabs($project);

        $connection = $this->em->getConnection();
        $connection->beginTransaction();

        try {
            $this->em->persist($project);
            $this->em->flush();

            $this->actionLogger->logGraphQLMutation(
                user: $viewer,
                actionType: LogActionType::CREATE,
                description: sprintf('le projet %s', $arguments['title']),
                entityType: Project::class,
                entityId: $project->getId()
            );

            $this->transformer->setProject($project);

            $form = $this->formFactory->create(ProjectAuthorsFormType::class, $project);
            $form->submit(['authors' => $this->transformer->transformUsers($dataAuthors)], false);

            if (!$form->isValid()) {
                $this->logger->error(__METHOD__ . ' : ' . (string) $form->getErrors(true, false));

                throw GraphQLException::fromFormErrors($form);
            }

            $this->em->flush();
            $connection->commit();
        } catch (DriverException $e) {
            $this->logger->error(
                __METHOD__ . ' => ' . $e->getErrorCode() . ' : ' . $e->getMessage()
            );

            if ($connection->isTransactionActive()) {
                $connection->rollBack();
            }

            throw new BadRequestHttpException('Sorry, please retry.');
        } catch (\Throwable $e) {
            if ($connection->isTransactionActive()) {
                $connection->rollBack();
            }

            throw $e;
        }

        $this->indexer->index(ClassUtils::getClass($project), $project->getId());
        $this->indexer->finishBulk();

        return ['project' => $project];
    }

    public function isGranted(): bool
    {
        return $this->authorizationChecker->isGranted(ProjectVoter::CREATE, new Project());
    }

    private function createDefaultTabs(Project $project): void
    {
        foreach (self::DEFAULT_TABS as $defaultTab) {
            /** @var class-string<ProjectTab> $projectTabClass */
            $projectTabClass = $defaultTab['class'];
            $projectTab = (new $projectTabClass())
                ->setTitle($defaultTab['title'])
                ->setSlug($this->slugger->slug($defaultTab['title'])->lower()->toString())
                ->setEnabled(true)
                ->setPosition($defaultTab['position'])
                ->setProject($project)
            ;

            $project->addTab($projectTab);
        }
    }
}
