<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver;

use Prophecy\Argument;
use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Repository\EventRepository;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Psr\Log\LoggerInterface;
use Doctrine\ORM\EntityRepository;
use Overblog\GraphQLBundle\Error\UserError;

class GlobalIdResolverSpec extends ObjectBehavior
{
    function it_is_initializable(ContainerInterface $container)
    {
        $this->beConstructedWith($container);
        $this->shouldHaveType(GlobalIdResolver::class);
    }

    function it_can_resolve_a_global_id(
        ContainerInterface $container,
        EventRepository $eventRepo,
        Event $event
    ) {
        $event->canDisplay(null)->willReturn(true);
        $eventRepo->find('event1')->willReturn($event);
        $container->get('capco.event.repository')->willReturn($eventRepo);
        $this->beConstructedWith($container);
        $globalId = GlobalId::toGlobalId('Event', 'event1');

        $this->resolve($globalId, null)->shouldReturn($event);
    }

    function it_can_not_resolve_an_unknown_global_id(
        ContainerInterface $container,
        LoggerInterface $logger
    ) {
        $id = 'Unknoownnnn1';
        $globalId = GlobalId::toGlobalId('Unknoownnnn', $id);

        $logger->warning('Could not resolve node with id ' . $id)->shouldBeCalled();
        $container->get('logger')->willReturn($logger);
        $this->beConstructedWith($container);
        $this->resolve($globalId, null)->shouldReturn(null);
    }

    function it_can_resolve_an_uuid(
        ContainerInterface $container,
        OpinionRepository $opinionRepo,
        Opinion $opinion
    ) {
        $uuid = 'opinion1';
        $opinionRepo->find($uuid)->willReturn($opinion);
        $container->get('capco.opinion.repository')->willReturn($opinionRepo);

        $this->beConstructedWith($container);
        $this->resolve($uuid, null)->shouldReturn($opinion);
    }

    function it_can_not_resolve_an_unknown_uuid(
        EntityRepository $repository,
        ContainerInterface $container,
        LoggerInterface $logger
    ) {
        $id = 'Unknoownnnn1';
        $repository->find($id)->willReturn(null);
        $logger->warning('Could not resolve node with id ' . $id)->shouldBeCalled();
        $container->get(Argument::any())->willReturn($repository);
        $container->get('logger')->willReturn($logger);
        $this->beConstructedWith($container);
        $this->shouldThrow(new UserError('Could not resolve node with id Unknoownnnn1'))->during(
            'resolve',
            [$id, null]
        );
    }
}
