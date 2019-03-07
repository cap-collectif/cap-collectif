<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver;

use Prophecy\Argument;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Event;
use Doctrine\ORM\EntityRepository;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Requirement;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Repository\EventRepository;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\RequirementRepository;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Symfony\Component\DependencyInjection\ContainerInterface;

class GlobalIdResolverSpec extends ObjectBehavior
{
    public function it_is_initializable(ContainerInterface $container, LoggerInterface $logger)
    {
        $this->beConstructedWith($container, $logger);
        $this->shouldHaveType(GlobalIdResolver::class);
    }

    public function it_can_resolve_a_global_id(
        ContainerInterface $container,
        LoggerInterface $logger,
        EventRepository $eventRepo,
        Event $event
    ) {
        $event->canDisplay(null)->willReturn(true);
        $eventRepo->find('event1')->willReturn($event);
        $container->get('capco.event.repository')->willReturn($eventRepo);
        $this->beConstructedWith($container, $logger);
        $globalId = GlobalId::toGlobalId('Event', 'event1');

        $this->resolve($globalId, null)->shouldReturn($event);
    }

    public function it_can_resolve_a_requirement(
        ContainerInterface $container,
        LoggerInterface $logger,
        RequirementRepository $repository,
        Requirement $requirement
    ) {
        $repository->find('requirement1')->willReturn($requirement);
        $container->get(RequirementRepository::class)->willReturn($repository);
        $this->beConstructedWith($container, $logger);
        $globalId = GlobalId::toGlobalId('Requirement', 'requirement1');

        $this->resolve($globalId, null)->shouldReturn($requirement);
    }

    public function it_can_not_resolve_an_unknown_global_id(
        ContainerInterface $container,
        LoggerInterface $logger
    ) {
        $id = 'Unknoownnnn1';
        $globalId = GlobalId::toGlobalId('Unknoownnnn', $id);

        $logger->warning('Could not resolve node with globalId ' . $id)->shouldBeCalled();
        $this->beConstructedWith($container, $logger);
        $this->resolve($globalId, null)->shouldReturn(null);
    }

    public function it_can_resolve_an_uuid(
        ContainerInterface $container,
        LoggerInterface $logger,
        OpinionRepository $opinionRepo,
        Opinion $opinion
    ) {
        $uuid = 'opinion1';
        $opinionRepo->find($uuid)->willReturn($opinion);
        $container->get('capco.opinion.repository')->willReturn($opinionRepo);

        $this->beConstructedWith($container, $logger);
        $this->resolve($uuid, null)->shouldReturn($opinion);
    }

    public function it_can_not_resolve_an_unknown_uuid(
        EntityRepository $repository,
        ContainerInterface $container,
        LoggerInterface $logger
    ) {
        $id = 'Unknoownnnn1';
        $repository->find($id)->willReturn(null);
        $logger->warning("Could not resolve node with uuid ${id}")->shouldBeCalled();
        $container->get(Argument::any())->willReturn($repository);
        $this->beConstructedWith($container, $logger);
        $this->resolve($id, null)->shouldReturn(null);
    }
}
