<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Prophecy\Argument;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\Form;
use Capco\AppBundle\Entity\Event;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Form\EventType;
use Symfony\Component\Form\FormError;
use Symfony\Component\Form\FormFactory;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Form\FormInterface;
use Capco\AppBundle\GraphQL\Mutation\AddEventMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;

class AddEventMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        LoggerInterface $logger,
        GlobalIdResolver $globalIdResolver,
        Indexer $indexer
    ) {
        $this->beConstructedWith($em, $formFactory, $logger, $globalIdResolver, $indexer);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(AddEventMutation::class);
    }

    public function it_persists_new_event(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        Arg $arguments,
        User $viewer,
        Form $form,
        Indexer $indexer,
        Event $event
    ) {
        $values = ['body' => 'My body'];

        $event->getBody()->willReturn('My body');
        $viewer->getId()->willReturn('iMTheAuthor');
        $viewer->getUsername()->willReturn('My username is toto');
        $viewer->isAdmin()->willReturn(false);
        $viewer->isSuperAdmin()->willReturn(false);

        $event->getAuthor()->willReturn($viewer);

        $form->submit($values, false)->willReturn(null);
        $form->isValid()->willReturn(true);

        $formFactory->create(EventType::class, Argument::type(Event::class))->willReturn($form);
        $arguments->getRawArguments()->willReturn($values);

        $em->persist(Argument::type(Event::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        // we cant moke ID with phpSpec, but in reality there is an ID
        $indexer->index(Event::class, null)->shouldBeCalled();
        $indexer->finishBulk()->shouldBeCalled();

        $payload = $this->__invoke($arguments, $viewer);
        $payload->shouldHaveCount(2);
        $payload['userErrors']->shouldBe([]);
        $payload['eventEdge']->shouldHaveType(Edge::class);
        $payload['eventEdge']->node->shouldHaveType(Event::class);
        $payload['eventEdge']->node->getAuthor()->shouldBe($viewer);
        $payload['eventEdge']->node->getAuthor()->shouldBe($viewer);
    }

    public function it_throws_error_on_invalid_form(
        Arg $arguments,
        FormFactory $formFactory,
        FormInterface $form,
        FormError $error,
        User $viewer,
        Event $event
    ) {
        $values = ['body' => ''];
        $arguments->getRawArguments()->willReturn($values);

        $viewer->getId()->willReturn('iMTheAuthor');
        $viewer->getUsername()->willReturn('My username is toto');
        $viewer->isAdmin()->willReturn(false);
        $viewer->isSuperAdmin()->willReturn(false);

        $event->setAuthor($viewer)->willReturn($event);
        $event->getAuthor()->willReturn($viewer);

        $error->getMessage()->willReturn('Invalid data.');
        $form->getErrors()->willReturn([$error]);
        $form->all()->willReturn([]);
        $form->isValid()->willReturn(false);
        $form->submit($values, false)->willReturn(null);
        $form->getExtraData()->willReturn([]);

        $formFactory->create(EventType::class, Argument::type(Event::class))->willReturn($form);
        $this->shouldThrow(GraphQLException::fromString('Invalid data.'))->during('__invoke', [
            $arguments,
            $viewer
        ]);
    }
}
