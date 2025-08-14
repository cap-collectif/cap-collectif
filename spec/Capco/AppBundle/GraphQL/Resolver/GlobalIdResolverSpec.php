<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Debate\DebateArticle;
use Capco\AppBundle\Entity\Debate\DebateOpinion;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\OfficialResponse;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Entity\SSO\CASSSOConfiguration;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Filter\ContributionCompletionStatusFilter;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\CASSSOConfigurationRepository;
use Capco\AppBundle\Repository\Debate\DebateAnonymousArgumentRepository;
use Capco\AppBundle\Repository\Debate\DebateArticleRepository;
use Capco\AppBundle\Repository\DebateArgumentRepository;
use Capco\AppBundle\Repository\DebateOpinionRepository;
use Capco\AppBundle\Repository\DebateRepository;
use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\Repository\OfficialResponseRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Repository\RequirementRepository;
use Capco\Manager\RepositoryManager;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\FilterCollection;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class GlobalIdResolverSpec extends ObjectBehavior
{
    public function it_is_initializable(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager,
        RepositoryManager $repositoryManager
    ) {
        $this->beConstructedWith($container, $logger, $entityManager, $repositoryManager);
        $this->shouldHaveType(GlobalIdResolver::class);
    }

    public function it_can_resolve_a_global_id(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager,
        RepositoryManager $repositoryManager,
        EventRepository $eventRepo,
        Event $event,
        FilterCollection $filterCollection
    ) {
        $entityManager->getFilters()->willReturn($filterCollection);
        $filterCollection->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)->willReturn(false);
        $filterCollection->enable(ContributionCompletionStatusFilter::FILTER_NAME)->shouldBeCalled();

        $event->canDisplay(null)->willReturn(true);
        $eventRepo->find('event1')->willReturn($event);

        $container->get(EventRepository::class)->willReturn($eventRepo);

        $repositoryManager->get('Event')->willReturn($eventRepo);
        $container->get(RepositoryManager::class)->willReturn($repositoryManager);

        $this->beConstructedWith($container, $logger, $entityManager, $repositoryManager);

        $globalId = GlobalId::toGlobalId('Event', 'event1');

        $this->resolve($globalId, null)->shouldReturn($event);
    }

    public function it_always_resolve_when_acl_disabled(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager,
        ProjectRepository $projectRepository,
        Project $project,
        FilterCollection $filterCollection,
        RepositoryManager $repositoryManager,
    ) {
        $entityManager->getFilters()->willReturn($filterCollection);
        $filterCollection->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)->willReturn(false);
        $filterCollection->enable(ContributionCompletionStatusFilter::FILTER_NAME)->shouldBeCalled();

        $projectRepository->find('ProjectAccessibleForMeOnly')->willReturn($project);
        $container->get(ProjectRepository::class)->willReturn($projectRepository);

        $repositoryManager->get('Project')->willReturn($projectRepository);
        $container->get(RepositoryManager::class)->willReturn($repositoryManager);

        $this->beConstructedWith($container, $logger, $entityManager, $repositoryManager);

        $globalId = GlobalId::toGlobalId('Project', 'ProjectAccessibleForMeOnly');

        $context = new \ArrayObject(
            [
                'disable_acl' => true,
            ],
            \ArrayObject::STD_PROP_LIST
        );

        $this->resolve($globalId, null, $context)->shouldReturn($project);
    }

    public function it_can_resolve_a_requirement(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager,
        RepositoryManager $repositoryManager,
        RequirementRepository $repository,
        Requirement $requirement,
        FilterCollection $filterCollection
    ) {
        $entityManager->getFilters()->willReturn($filterCollection);
        $filterCollection->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)->willReturn(false);
        $filterCollection->enable(ContributionCompletionStatusFilter::FILTER_NAME)->shouldBeCalled();

        $repository->find('requirement1')->willReturn($requirement);
        $container->get(RequirementRepository::class)->willReturn($repository);

        $repositoryManager->get('Requirement')->willReturn($repository);
        $container->get(RepositoryManager::class)->willReturn($repositoryManager);

        $this->beConstructedWith($container, $logger, $entityManager, $repositoryManager);

        $globalId = GlobalId::toGlobalId('Requirement', 'requirement1');

        $this->resolve($globalId, null)->shouldReturn($requirement);
    }

    public function it_can_resolve_a_debate_step(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager,
        RepositoryManager $repositoryManager,
        AbstractStepRepository $repository,
        DebateStep $debateStep,
        FilterCollection $filterCollection
    ) {
        $entityManager->getFilters()->willReturn($filterCollection);
        $filterCollection->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)->willReturn(false);
        $filterCollection->enable(ContributionCompletionStatusFilter::FILTER_NAME)->shouldBeCalled();

        $debateStep->canDisplay(null)->willReturn(true);
        $repository->find('debateStepCannabis')->willReturn($debateStep);

        $container->get(AbstractStepRepository::class)->willReturn($repository);

        $repositoryManager->get('DebateStep')->willReturn($repository);
        $container->get(RepositoryManager::class)->willReturn($repositoryManager);

        $this->beConstructedWith($container, $logger, $entityManager, $repositoryManager);

        $globalId = GlobalId::toGlobalId('DebateStep', 'debateStepCannabis');

        $this->resolve($globalId, null)->shouldReturn($debateStep);
    }

    public function it_can_resolve_a_debate_opinion(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager,
        RepositoryManager $repositoryManager,
        DebateOpinionRepository $repository,
        DebateOpinion $debateOpinion,
        FilterCollection $filterCollection
    ) {
        $entityManager->getFilters()->willReturn($filterCollection);
        $filterCollection->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)->willReturn(false);
        $filterCollection->enable(ContributionCompletionStatusFilter::FILTER_NAME)->shouldBeCalled();

        $repository->find('debateCannabisOpinion1')->willReturn($debateOpinion);
        $container->get(DebateOpinionRepository::class)->willReturn($repository);

        $repositoryManager->get('DebateOpinion')->willReturn($repository);
        $container->get(RepositoryManager::class)->willReturn($repositoryManager);

        $this->beConstructedWith($container, $logger, $entityManager, $repositoryManager);

        $globalId = GlobalId::toGlobalId('DebateOpinion', 'debateCannabisOpinion1');

        $this->resolve($globalId, null)->shouldReturn($debateOpinion);
    }

    public function it_can_resolve_a_debate_article(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager,
        RepositoryManager $repositoryManager,
        DebateArticleRepository $repository,
        DebateArticle $article,
        FilterCollection $filterCollection
    ) {
        $entityManager->getFilters()->willReturn($filterCollection);
        $filterCollection->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)->willReturn(false);
        $filterCollection->enable(ContributionCompletionStatusFilter::FILTER_NAME)->shouldBeCalled();

        $repository->find('canabisArticleBfm')->willReturn($article);
        $container->get(DebateArticleRepository::class)->willReturn($repository);

        $repositoryManager->get('DebateArticle')->willReturn($repository);
        $container->get(RepositoryManager::class)->willReturn($repositoryManager);

        $this->beConstructedWith($container, $logger, $entityManager, $repositoryManager);

        $globalId = GlobalId::toGlobalId('DebateArticle', 'canabisArticleBfm');

        $this->resolve($globalId, null)->shouldReturn($article);
    }

    public function it_can_resolve_a_debate_argument(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager,
        RepositoryManager $repositoryManager,
        DebateArgumentRepository $repository,
        DebateArgument $argument,
        FilterCollection $filterCollection
    ) {
        $entityManager->getFilters()->willReturn($filterCollection);
        $filterCollection->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)->willReturn(false);
        $filterCollection->enable(ContributionCompletionStatusFilter::FILTER_NAME)->shouldBeCalled();

        $repository->find('debateArgument1')->willReturn($argument);
        $container->get(DebateArgumentRepository::class)->willReturn($repository);

        $repositoryManager->get('DebateArgument')->willReturn($repository);
        $container->get(RepositoryManager::class)->willReturn($repositoryManager);

        $this->beConstructedWith($container, $logger, $entityManager, $repositoryManager);

        $globalId = GlobalId::toGlobalId('DebateArgument', 'debateArgument1');

        $this->resolve($globalId, null)->shouldReturn($argument);
    }

    public function it_can_resolve_a_debate_anonymous_argument(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager,
        RepositoryManager $repositoryManager,
        DebateArgumentRepository $repository,
        DebateAnonymousArgumentRepository $anonymousRepository,
        DebateAnonymousArgument $argument,
        FilterCollection $filterCollection
    ) {
        $entityManager->getFilters()->willReturn($filterCollection);
        $filterCollection->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)->willReturn(false);
        $filterCollection->enable(ContributionCompletionStatusFilter::FILTER_NAME)->shouldBeCalled();

        $repository->find('debateArgument1')->willReturn(null);
        $anonymousRepository->find('debateArgument1')->willReturn($argument);

        $container->get(DebateArgumentRepository::class)->willReturn($repository);
        $container->get(DebateAnonymousArgumentRepository::class)->willReturn($anonymousRepository);

        $repositoryManager->get('DebateArgument')->willReturn($repository);
        $container->get(RepositoryManager::class)->willReturn($repositoryManager);

        $this->beConstructedWith($container, $logger, $entityManager, $repositoryManager);

        $globalId = GlobalId::toGlobalId('DebateArgument', 'debateArgument1');

        $this->resolve($globalId, null)->shouldReturn($argument);
    }

    public function it_can_resolve_a_debate(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager,
        RepositoryManager $repositoryManager,
        DebateRepository $repository,
        Debate $debate,
        FilterCollection $filterCollection
    ) {
        $entityManager->getFilters()->willReturn($filterCollection);
        $filterCollection->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)->willReturn(false);
        $filterCollection->enable(ContributionCompletionStatusFilter::FILTER_NAME)->shouldBeCalled();

        $repository->find('debateCannabis')->willReturn($debate);
        $container->get(DebateRepository::class)->willReturn($repository);

        $repositoryManager->get('Debate')->willReturn($repository);
        $container->get(RepositoryManager::class)->willReturn($repositoryManager);

        $this->beConstructedWith($container, $logger, $entityManager, $repositoryManager);

        $globalId = GlobalId::toGlobalId('Debate', 'debateCannabis');

        $this->resolve($globalId, null)->shouldReturn($debate);
    }

    public function it_can_resolve_an_official_response(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager,
        RepositoryManager $repositoryManager,
        OfficialResponseRepository $repository,
        OfficialResponse $officialResponse,
        FilterCollection $filterCollection
    ) {
        $entityManager->getFilters()->willReturn($filterCollection);
        $filterCollection->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)->willReturn(false);
        $filterCollection->enable(ContributionCompletionStatusFilter::FILTER_NAME)->shouldBeCalled();

        $repository->find('officialResponse11')->willReturn($officialResponse);
        $container->get(OfficialResponseRepository::class)->willReturn($repository);

        $repositoryManager->get('OfficialResponse')->willReturn($repository);
        $container->get(RepositoryManager::class)->willReturn($repositoryManager);

        $this->beConstructedWith($container, $logger, $entityManager, $repositoryManager);

        $globalId = GlobalId::toGlobalId('OfficialResponse', 'officialResponse11');

        $this->resolve($globalId, null)->shouldReturn($officialResponse);
    }

    public function it_can_not_resolve_an_unknown_global_id(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager,
        RepositoryManager $repositoryManager,
        EntityRepository $repository,
        FilterCollection $filterCollection
    ) {
        $entityManager->getFilters()->willReturn($filterCollection);
        $filterCollection->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)->willReturn(false);
        $filterCollection->enable(ContributionCompletionStatusFilter::FILTER_NAME)->shouldBeCalled();

        $id = 'Unknoownnnn1';
        $globalId = GlobalId::toGlobalId('Unknoownnnn', $id);

        $repository->find($id)->willReturn(null);
        $repository->find($globalId)->willReturn(null);
        $container->get(Argument::any())->willReturn($repository);

        $logger->warning('Could not resolve node with uuid ' . $globalId)->shouldBeCalled();

        $this->beConstructedWith($container, $logger, $entityManager, $repositoryManager);

        $this->resolve($globalId, null)->shouldReturn(null);
    }

    public function it_can_resolve_an_uuid(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager,
        RepositoryManager $repositoryManager,
        OpinionRepository $opinionRepo,
        Opinion $opinion,
        FilterCollection $filterCollection
    ) {
        $entityManager->getFilters()->willReturn($filterCollection);
        $filterCollection->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)->willReturn(false);
        $filterCollection->enable(ContributionCompletionStatusFilter::FILTER_NAME)->shouldBeCalled();

        $uuid = 'opinion1';
        $opinionRepo->find($uuid)->willReturn($opinion);
        $container->get(OpinionRepository::class)->willReturn($opinionRepo);

        $this->beConstructedWith($container, $logger, $entityManager, $repositoryManager);
        $this->resolve($uuid, null)->shouldReturn($opinion);
    }

    public function it_can_resolve_a_cas_sso_configuration(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager,
        RepositoryManager $repositoryManager,
        CASSSOConfigurationRepository $repository,
        CASSSOConfiguration $casSSOConfiguration,
        FilterCollection $filterCollection
    ) {
        $entityManager->getFilters()->willReturn($filterCollection);
        $filterCollection->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)->willReturn(false);
        $filterCollection->enable(ContributionCompletionStatusFilter::FILTER_NAME)->shouldBeCalled();

        $id = 'casSSOConfigurationID';
        $container->get(CASSSOConfigurationRepository::class)->willReturn($repository);

        $repository->find($id)->willReturn($casSSOConfiguration);

        $repositoryManager->get('CASSSOConfiguration')->willReturn($repository);
        $container->get(RepositoryManager::class)->willReturn($repositoryManager);

        $this->beConstructedWith($container, $logger, $entityManager, $repositoryManager);

        $globalId = GlobalId::toGlobalId('CASSSOConfiguration', $id);

        $this->resolve($globalId, null)->shouldReturn($casSSOConfiguration);
    }

    public function it_can_not_resolve_an_unknown_uuid(
        EntityRepository $repository,
        ContainerInterface $container,
        LoggerInterface $logger,
        RepositoryManager $repositoryManager,
        EntityManagerInterface $entityManager,
        FilterCollection $filterCollection
    ) {
        $entityManager->getFilters()->willReturn($filterCollection);
        $filterCollection->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)->willReturn(false);
        $filterCollection->enable(ContributionCompletionStatusFilter::FILTER_NAME)->shouldBeCalled();

        $id = 'Unknoownnnn1';
        $repository->find($id)->willReturn(null);

        $logger->warning("Could not resolve node with uuid {$id}")->shouldBeCalled();

        $container->get(Argument::any())->willReturn($repository);

        $this->beConstructedWith($container, $logger, $entityManager, $repositoryManager);

        $this->resolve($id, null)->shouldReturn(null);
    }
}
