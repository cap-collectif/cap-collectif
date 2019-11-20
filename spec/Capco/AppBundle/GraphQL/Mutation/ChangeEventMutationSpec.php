<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\Form;
use Capco\AppBundle\Entity\Event;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Form\EventType;
use Symfony\Component\Form\FormFactory;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Mutation\ChangeEventMutation;
use Symfony\Component\Form\FormError;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class ChangeEventMutationSpec extends ObjectBehavior
{
    public function let(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        FormFactory $formFactory,
        LoggerInterface $logger,
        Indexer $indexer,
        Publisher $publisher,
        AuthorizationCheckerInterface $authorizationChecker

    ) {
        $this->beConstructedWith(
            $globalIdResolver,
            $em,
            $formFactory,
            $logger,
            $indexer,
            $publisher,
            $authorizationChecker
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(ChangeEventMutation::class);
    }

    public function it_updates_an_event(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        FormFactory $formFactory,
        Arg $arguments,
        User $viewer,
        Form $form,
        Event $event,
        Publisher $publisher,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $values = [
            'id' => 'base64id',
            'body' => 'My body',
            'customCode' => 'abc',
            'startAt' => '2050-02-03 10:00:00'
        ];

        $viewer->isAdmin()->willReturn(true);
        $arguments->getArrayCopy()->willReturn($values);
        $globalIdResolver->resolve('base64id', $viewer)->willReturn($event);
        $event->getId()->willReturn('event1');
        $event->setStartAt(new \DateTime('2050-02-03 10:00:00'))->willReturn($event);
        $formFactory->create(EventType::class, $event)->willReturn($form);
        $form->submit(['body' => 'My body', 'customCode' => 'abc'], false)->willReturn(null);
        $form->isValid()->willReturn(true);
        $em->flush()->shouldBeCalled();
        $authorizationChecker->isGranted('edit', \Prophecy\Argument::type(Event::class))->willReturn(true);
        $publisher
            ->publish('event.update', \Prophecy\Argument::type(Message::class))
            ->shouldNotBeCalled();

        $payload = $this->__invoke($arguments, $viewer);
        $payload->shouldHaveCount(2);
        $payload['userErrors']->shouldBe([]);
        $payload['event']->shouldBe($event);
    }

    public function it_resolve_userErrors_on_unknown_id(
        GlobalIdResolver $globalIdResolver,
        Arg $arguments,
        User $viewer
    ) {
        $values = ['id' => 'base64id', 'body' => 'My body'];
        $arguments->getArrayCopy()->willReturn($values);
        $globalIdResolver->resolve('base64id', $viewer)->willReturn(null);
        $this->__invoke($arguments, $viewer)->shouldBe([
            'event' => null,
            'userErrors' => [['message' => 'Could not find your event.']]
        ]);
    }

    public function it_throws_error_on_invalid_form(
        GlobalIdResolver $globalIdResolver,
        Arg $arguments,
        FormFactory $formFactory,
        Form $form,
        FormError $error,
        User $viewer,
        Event $event,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $values = ['id' => 'base64id', 'body' => ''];

        $arguments->getArrayCopy()->willReturn($values);
        $globalIdResolver->resolve('base64id', $viewer)->willReturn($event);
        $formFactory->create(EventType::class, $event)->willReturn($form);

        $form->submit(['body' => ''], false)->willReturn(null);
        $error->getMessage()->willReturn('Invalid data.');
        $form->getErrors()->willReturn([$error]);
        $form->all()->willReturn([]);
        $form->isValid()->willReturn(false);
        $authorizationChecker->isGranted('edit', \Prophecy\Argument::type(Event::class))->willReturn(true);

        $this->shouldThrow(GraphQLException::fromString('Invalid data.'))->during('__invoke', [
            $arguments,
            $viewer
        ]);
    }

    public function it_try_to_persists_new_event_with_customCode_as_user(
        Arg $arguments,
        User $viewer
    ) {
        $values = ['body' => 'My body', 'customCode' => 'abc'];
        $viewer->getId()->willReturn('iMTheAuthor');
        $viewer->getUsername()->willReturn('My username is toto');
        $viewer->isAdmin()->willReturn(false);

        $arguments->getArrayCopy()->willReturn($values);
        $this->__invoke($arguments, $viewer)->shouldBe([
            'event' => null,
            'userErrors' => [['message' => 'You are not authorized to add customCode field.']]
        ]);
    }

    public function it_try_edit_a_user_event(
        Arg $arguments,
        User $viewer,
        Event $event,
        User $author,
        AuthorizationCheckerInterface $authorizationChecker,
        GlobalIdResolver $globalIdResolver
    ) {
        $values = ['body' => 'My body', 'id' => 'base64id'];
        $viewer->getId()->willReturn('iMNotTheAuthor');
        $viewer->getUsername()->willReturn('My username is toto');
        $viewer->isAdmin()->willReturn(false);
        $globalIdResolver->resolve('base64id', $viewer)->willReturn($event);

        $author->isAdmin()->willReturn(false);
        $author->getId()->willReturn('iMTheAuthor');
        $author->getUsername()->willReturn('My username is titi');

        $event->getAuthor()->willReturn($author);

        $authorizationChecker->isGranted('edit', \Prophecy\Argument::type(Event::class))->willReturn(false);

        $arguments->getArrayCopy()->willReturn($values);
        $this->__invoke($arguments, $viewer)->shouldBe([
            'event' => null,
            'userErrors' => [['message' => 'Access denied']]
        ]);
    }
}
