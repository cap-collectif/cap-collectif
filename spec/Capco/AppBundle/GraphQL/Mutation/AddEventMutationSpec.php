<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Prophecy\Argument;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\Form;
use Capco\AppBundle\Entity\Event;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Form\EventType;
use Symfony\Component\Form\FormError;
use Symfony\Component\Form\FormFactory;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;
use Capco\AppBundle\GraphQL\Mutation\AddEventMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Symfony\Component\Translation\Translator;

class AddEventMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        GlobalIdResolver $globalIdResolver,
        Indexer $indexer,
        Publisher $publisher,
        Translator $translator
    ) {
        $this->beConstructedWith(
            $em,
            $formFactory,
            $logger,
            $globalIdResolver,
            $indexer,
            $publisher,
            $translator
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(AddEventMutation::class);
    }

    public function it_persists_new_event(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        Arg $arguments,
        User $viewer,
        Form $form,
        Indexer $indexer,
        Event $event,
        Publisher $publisher
    ) {
        $values = ['body' => 'My body', 'startAt' => '2019-04-09T22:00:23.000'];

        $event->getBody()->willReturn('My body');
        $viewer->getId()->willReturn('iMTheAuthor');
        $viewer->getUsername()->willReturn('My username is toto');
        $viewer->isAdmin()->willReturn(false);
        $viewer->isSuperAdmin()->willReturn(false);

        $event->getAuthor()->willReturn($viewer);

        $form->submit(['body' => 'My body'], false)->willReturn(null);
        $form->isValid()->willReturn(true);

        $formFactory->create(EventType::class, Argument::type(Event::class))->willReturn($form);
        $arguments->getArrayCopy()->willReturn($values);

        $em->persist(Argument::type(Event::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        // we cant moke ID with phpSpec, but in reality there is an ID
        $indexer->index(Event::class, null)->shouldBeCalled();
        $indexer->finishBulk()->shouldBeCalled();

        $publisher
            ->publish('event.create', \Prophecy\Argument::type(Message::class))
            ->shouldBeCalled();

        $payload = $this->__invoke($arguments, $viewer);
        $payload->shouldHaveCount(2);
        $payload['userErrors']->shouldBe([]);
        $payload['eventEdge']->shouldHaveType(Edge::class);
        $payload['eventEdge']->node->shouldHaveType(Event::class);
        $payload['eventEdge']->node->getAuthor()->shouldBe($viewer);
    }

    public function it_try_to_persists_new_event_with_customCode_as_user(
        Arg $arguments,
        User $viewer
    ) {
        $values = [
            'body' => 'My body',
            'customCode' => 'abc',
            'startAt' => '2019-04-09T22:00:23.000'
        ];
        $viewer->getId()->willReturn('iMTheAuthor');
        $viewer->getUsername()->willReturn('My username is toto');
        $viewer->isAdmin()->willReturn(false);
        $viewer->isSuperAdmin()->willReturn(false);

        $arguments->getArrayCopy()->willReturn($values);
        $payload = $this->__invoke($arguments, $viewer);
        $payload->shouldHaveCount(2);
        $payload['userErrors']->shouldBe([
            ['message' => 'You are not authorized to add customCode field.']
        ]);
        $payload['eventEdge']->shouldBe(null);
    }

    public function it_try_to_persists_new_event_with_customCode_as_admin(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        Arg $arguments,
        User $viewer,
        Form $form,
        Indexer $indexer,
        Event $event
    ) {
        $values = [
            'body' => 'My body',
            'customCode' => 'abc',
            'startAt' => '2019-04-09T22:00:23.000'
        ];

        $event->getBody()->willReturn('My body');
        $viewer->getId()->willReturn('iMTheAuthor');
        $viewer->getUsername()->willReturn('My username is toto');
        $viewer->isAdmin()->willReturn(true);

        $event->getAuthor()->willReturn($viewer);

        $form->submit(['body' => 'My body', 'customCode' => 'abc'], false)->willReturn(null);
        $form->isValid()->willReturn(true);

        $formFactory->create(EventType::class, Argument::type(Event::class))->willReturn($form);
        $arguments->getArrayCopy()->willReturn($values);

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
    }

    public function it_throws_error_on_invalid_form(
        Arg $arguments,
        FormFactory $formFactory,
        FormInterface $form,
        FormError $error,
        User $viewer,
        Event $event
    ) {
        $values = ['body' => '', 'startAt' => '2019-04-09T22:00:23.000'];
        $arguments->getArrayCopy()->willReturn($values);

        $viewer->getId()->willReturn('iMTheAuthor');
        $viewer->getUsername()->willReturn('My username is toto');
        $viewer->isAdmin()->willReturn(false);

        $event->setAuthor($viewer)->willReturn($event);
        $event->getAuthor()->willReturn($viewer);

        $error->getMessage()->willReturn('Invalid data.');
        $form->getErrors()->willReturn([$error]);
        $form->all()->willReturn([]);
        $form->isValid()->willReturn(false);
        $form->submit(['body' => ''], false)->willReturn(null);
        $form->getExtraData()->willReturn([]);

        $formFactory->create(EventType::class, Argument::type(Event::class))->willReturn($form);
        $this->shouldThrow(GraphQLException::fromString('Invalid data.'))->during('__invoke', [
            $arguments,
            $viewer
        ]);
    }
}
