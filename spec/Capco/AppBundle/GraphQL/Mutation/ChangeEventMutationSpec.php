<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\DBAL\Enum\EventReviewStatusType;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\EventReview;
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
            'customCode' => 'abc',
            'startAt' => '2050-02-03 10:00:00',
            'translations' => [
                [
                    'locale' => 'fr-FR',
                    'body' => 'My body'
                ]
            ]
        ];

        $viewer->isAdmin()->willReturn(true);
        $arguments->getArrayCopy()->willReturn($values);
        $globalIdResolver->resolve('base64id', $viewer)->willReturn($event);
        $event->getId()->willReturn('event1');
        $event->setStartAt(new \DateTime('2050-02-03 10:00:00'))->willReturn($event);
        $formFactory->create(EventType::class, $event)->willReturn($form);
        $form
            ->submit(
                [
                    'customCode' => 'abc',
                    'translations' => ['fr-FR' => ['locale' => 'fr-FR', 'body' => 'My body']]
                ],
                false
            )
            ->willReturn(null);
        $form->isValid()->willReturn(true);
        $em->flush()->shouldBeCalled();
        $authorizationChecker
            ->isGranted('edit', \Prophecy\Argument::type(Event::class))
            ->willReturn(true);
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
        EventReview $eventReview,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $values = ['id' => 'base64id', 'body' => '', 'translations' => []];

        $viewer->isAdmin()->willReturn(false);
        $arguments->getArrayCopy()->willReturn($values);
        $globalIdResolver->resolve('base64id', $viewer)->willReturn($event);
        $formFactory->create(EventType::class, $event)->willReturn($form);

        $eventReview->getStatus()->willReturn(EventReviewStatusType::AWAITING);
        $event->getAuthor()->willReturn($viewer);
        $event->getReview()->willReturn($eventReview);
        $event->getStatus()->willReturn(EventReviewStatusType::AWAITING);

        $form->submit(['body' => '', 'translations' => []], false)->willReturn(null);
        $error->getMessage()->willReturn('Invalid data.');
        $form->getErrors()->willReturn([$error]);
        $form->all()->willReturn([]);
        $form->isValid()->willReturn(false);
        $authorizationChecker
            ->isGranted('edit', \Prophecy\Argument::type(Event::class))
            ->willReturn(true);

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

        $authorizationChecker
            ->isGranted('edit', \Prophecy\Argument::type(Event::class))
            ->willReturn(false);

        $arguments->getArrayCopy()->willReturn($values);
        $this->__invoke($arguments, $viewer)->shouldBe([
            'event' => null,
            'userErrors' => [['message' => 'Access denied']]
        ]);
    }

    public function it_updates_a_refused__event(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        FormFactory $formFactory,
        Arg $arguments,
        User $viewer,
        Form $form,
        User $reviewer,
        Event $event,
        EventReview $eventReview,
        Publisher $publisher,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $values = [
            'id' => 'base64id',
            'startAt' => '2050-02-03 10:00:00',
            'translations' => [
                [
                    'locale' => 'fr-FR',
                    'body' => 'New body'
                ]
            ]
        ];

        $viewer->isAdmin()->willReturn(false);
        $arguments->getArrayCopy()->willReturn($values);

        $reviewer->isAdmin()->willReturn(true);
        $reviewer->getId()->willReturn('reviewer');

        $eventReview->getReviewer()->willReturn($reviewer);
        $eventReview->getStatus()->willReturn(EventReviewStatusType::REFUSED);

        $event->getReview()->willReturn($eventReview);
        $event->getStatus()->willReturn(EventReviewStatusType::REFUSED);

        $globalIdResolver->resolve('base64id', $viewer)->willReturn($event);
        $event->getId()->willReturn('event1');
        $event->setStartAt(new \DateTime('2050-02-03 10:00:00'))->willReturn($event);

        $eventReview->setStatus(EventReviewStatusType::AWAITING)->shouldBeCalled();

        $formFactory->create(EventType::class, $event)->willReturn($form);
        $form
            ->submit(
                ['translations' => ['fr-FR' => ['locale' => 'fr-FR', 'body' => 'New body']]],
                false
            )
            ->willReturn(null);
        $form->isValid()->willReturn(true);
        $em->flush()->shouldBeCalled();

        $authorizationChecker
            ->isGranted('edit', \Prophecy\Argument::type(Event::class))
            ->willReturn(true);
        $publisher
            ->publish('event.update', \Prophecy\Argument::type(Message::class))
            ->shouldBeCalled();

        $payload = $this->__invoke($arguments, $viewer);
        $payload->shouldHaveCount(2);
        $payload['userErrors']->shouldBe([]);
        $payload['event']->shouldBe($event);
    }
}
