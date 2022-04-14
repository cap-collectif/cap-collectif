<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Debate\DebateArticle;
use Capco\AppBundle\Entity\OfficialResponse;
use Capco\AppBundle\Entity\SSO\CASSSOConfiguration;
use Capco\AppBundle\Repository\CASSSOConfigurationRepository;
use Capco\AppBundle\Repository\Debate\DebateAnonymousArgumentRepository;
use Capco\AppBundle\Repository\Debate\DebateArticleRepository;
use Capco\AppBundle\Repository\DebateArgumentRepository;
use Capco\AppBundle\Repository\OfficialResponseRepository;
use Prophecy\Argument;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Event;
use Doctrine\ORM\EntityRepository;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Requirement;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Repository\EventRepository;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Capco\AppBundle\Entity\Debate\DebateOpinion;
use Capco\AppBundle\Repository\DebateRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Repository\RequirementRepository;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\DebateOpinionRepository;
use Symfony\Component\DependencyInjection\ContainerInterface;

class GlobalIdResolverSpec extends ObjectBehavior
{
    public function it_is_initializable(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager
    ) {
        $this->beConstructedWith($container, $logger, $entityManager);
        $this->shouldHaveType(GlobalIdResolver::class);
    }

    public function it_can_resolve_a_global_id(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager,
        EventRepository $eventRepo,
        Event $event
    ) {
        $event->canDisplay(null)->willReturn(true);
        $eventRepo->find('event1')->willReturn($event);
        $container->get(EventRepository::class)->willReturn($eventRepo);
        $this->beConstructedWith($container, $logger, $entityManager);
        $globalId = GlobalId::toGlobalId('Event', 'event1');

        $this->resolve($globalId, null)->shouldReturn($event);
    }

    public function it_always_resolve_when_acl_disabled(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager,
        ProjectRepository $projectRepository,
        Project $project
    ) {
        $projectRepository->find('ProjectAccessibleForMeOnly')->willReturn($project);
        $container->get(ProjectRepository::class)->willReturn($projectRepository);
        $this->beConstructedWith($container, $logger, $entityManager);
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
        RequirementRepository $repository,
        Requirement $requirement
    ) {
        $repository->find('requirement1')->willReturn($requirement);
        $container->get(RequirementRepository::class)->willReturn($repository);
        $this->beConstructedWith($container, $logger, $entityManager);
        $globalId = GlobalId::toGlobalId('Requirement', 'requirement1');

        $this->resolve($globalId, null)->shouldReturn($requirement);
    }

    public function it_can_resolve_a_debate_step(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager,
        AbstractStepRepository $repository,
        DebateStep $debateStep
    ) {
        $debateStep->canDisplay(null)->willReturn(true);
        $repository->find('debateStepCannabis')->willReturn($debateStep);
        $container->get(AbstractStepRepository::class)->willReturn($repository);
        $this->beConstructedWith($container, $logger, $entityManager);
        $globalId = GlobalId::toGlobalId('DebateStep', 'debateStepCannabis');

        $this->resolve($globalId, null)->shouldReturn($debateStep);
    }

    public function it_can_resolve_a_debate_opinion(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager,
        DebateOpinionRepository $repository,
        DebateOpinion $debateOpinion
    ) {
        $repository->find('debateCannabisOpinion1')->willReturn($debateOpinion);
        $container->get(DebateOpinionRepository::class)->willReturn($repository);
        $this->beConstructedWith($container, $logger, $entityManager);
        $globalId = GlobalId::toGlobalId('DebateOpinion', 'debateCannabisOpinion1');

        $this->resolve($globalId, null)->shouldReturn($debateOpinion);
    }

    public function it_can_resolve_a_debate_article(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager,
        DebateArticleRepository $repository,
        DebateArticle $article
    ) {
        $repository->find('canabisArticleBfm')->willReturn($article);
        $container->get(DebateArticleRepository::class)->willReturn($repository);
        $this->beConstructedWith($container, $logger, $entityManager);
        $globalId = GlobalId::toGlobalId('DebateArticle', 'canabisArticleBfm');

        $this->resolve($globalId, null)->shouldReturn($article);
    }

    public function it_can_resolve_a_debate_argument(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager,
        DebateArgumentRepository $repository,
        DebateArgument $argument
    ) {
        $repository->find('debateArgument1')->willReturn($argument);
        $container->get(DebateArgumentRepository::class)->willReturn($repository);
        $this->beConstructedWith($container, $logger, $entityManager);
        $globalId = GlobalId::toGlobalId('DebateArgument', 'debateArgument1');

        $this->resolve($globalId, null)->shouldReturn($argument);
    }

    public function it_can_resolve_a_debate_anonymous_argument(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager,
        DebateArgumentRepository $repository,
        DebateAnonymousArgumentRepository $anonymousRepository,
        DebateAnonymousArgument $argument
    ) {
        $repository->find('debateArgument1')->willReturn(null);
        $anonymousRepository->find('debateArgument1')->willReturn($argument);
        $container->get(DebateArgumentRepository::class)->willReturn($repository);
        $container->get(DebateAnonymousArgumentRepository::class)->willReturn($anonymousRepository);
        $this->beConstructedWith($container, $logger, $entityManager);
        $globalId = GlobalId::toGlobalId('DebateArgument', 'debateArgument1');

        $this->resolve($globalId, null)->shouldReturn($argument);
    }

    public function it_can_resolve_a_debate(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager,
        DebateRepository $repository,
        Debate $debate
    ) {
        $repository->find('debateCannabis')->willReturn($debate);
        $container->get(DebateRepository::class)->willReturn($repository);
        $this->beConstructedWith($container, $logger, $entityManager);
        $globalId = GlobalId::toGlobalId('Debate', 'debateCannabis');

        $this->resolve($globalId, null)->shouldReturn($debate);
    }

    public function it_can_resolve_an_official_response(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager,
        OfficialResponseRepository $repository,
        OfficialResponse $officialResponse
    ) {
        $repository->find('officialResponse11')->willReturn($officialResponse);
        $container->get(OfficialResponseRepository::class)->willReturn($repository);
        $this->beConstructedWith($container, $logger, $entityManager);
        $globalId = GlobalId::toGlobalId('OfficialResponse', 'officialResponse11');

        $this->resolve($globalId, null)->shouldReturn($officialResponse);
    }

    public function it_can_not_resolve_an_unknown_global_id(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager
    ) {
        $id = 'Unknoownnnn1';
        $globalId = GlobalId::toGlobalId('Unknoownnnn', $id);

        $logger->warning('Could not resolve node with globalId ' . $id)->shouldBeCalled();
        $this->beConstructedWith($container, $logger, $entityManager);
        $this->resolve($globalId, null)->shouldReturn(null);
    }

    public function it_can_resolve_an_uuid(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager,
        OpinionRepository $opinionRepo,
        Opinion $opinion
    ) {
        $uuid = 'opinion1';
        $opinionRepo->find($uuid)->willReturn($opinion);
        $container->get(OpinionRepository::class)->willReturn($opinionRepo);

        $this->beConstructedWith($container, $logger, $entityManager);
        $this->resolve($uuid, null)->shouldReturn($opinion);
    }

    public function it_can_resolve_a_cas_sso_configuration(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager,
        CASSSOConfigurationRepository $repository,
        CASSSOConfiguration $casSSOConfiguration
    ) {
        $id = 'casSSOConfigurationID';
        $container->get(CASSSOConfigurationRepository::class)->willReturn($repository);
        $repository->find($id)->willReturn($casSSOConfiguration);
        $this->beConstructedWith($container, $logger, $entityManager);
        $globalId = GlobalId::toGlobalId('CASSSOConfiguration', $id);

        $this->resolve($globalId, null)->shouldReturn($casSSOConfiguration);
    }

    public function it_can_not_resolve_an_unknown_uuid(
        EntityRepository $repository,
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager
    ) {
        $id = 'Unknoownnnn1';
        $repository->find($id)->willReturn(null);
        $logger->warning("Could not resolve node with uuid ${id}")->shouldBeCalled();
        $container->get(Argument::any())->willReturn($repository);
        $this->beConstructedWith($container, $logger, $entityManager);
        $this->resolve($id, null)->shouldReturn(null);
    }
}
