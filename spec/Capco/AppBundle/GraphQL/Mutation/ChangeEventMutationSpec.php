<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\DBAL\Enum\EventReviewStatusType;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\EventReview;
use Capco\AppBundle\Security\EventVoter;
use DateTime;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
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
use Capco\AppBundle\GraphQL\Mutation\ChangeEventMutation;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Component\Translation\Translator;

class ChangeEventMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        FormFactoryInterface $formFactory,
        Indexer $indexer,
        Publisher $publisher,
        AuthorizationCheckerInterface $authorizationChecker,
        Translator $translator
    ) {
        $this->beConstructedWith(
            $em,
            $globalIdResolver,
            $formFactory,
            $indexer,
            $publisher,
            $authorizationChecker,
            $translator
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
                    'body' => 'My body',
                ],
            ],
        ];

        $viewer->isAdmin()->willReturn(true);
        $viewer->isProjectAdmin()->willReturn(true);
        $arguments->getArrayCopy()->willReturn($values);
        $globalIdResolver->resolve('base64id', $viewer)->willReturn($event);
        $event->getId()->willReturn('event1');
        $event->setStartAt(new DateTime('2050-02-03 10:00:00'))->willReturn($event);
        $event->getAuthor()->willReturn($viewer);
        $event->setAuthor($viewer)->willReturn($event);
        $formFactory->create(EventType::class, $event)->willReturn($form);
        $form
            ->submit(
                [
                    'customCode' => 'abc',
                    'translations' => ['fr-FR' => ['locale' => 'fr-FR', 'body' => 'My body']],
                ],
                false
            )
            ->willReturn(null);
        $form->isValid()->willReturn(true);
        $em->flush()->shouldBeCalled();
        $authorizationChecker->isGranted('edit', Argument::type(Event::class))->willReturn(true);
        $publisher->publish('event.update', Argument::type(Message::class))->shouldNotBeCalled();

        $payload = $this->__invoke($arguments, $viewer);
        $payload->shouldHaveCount(2);
        $payload['userErrors']->shouldBe([]);
        $payload['event']->shouldBe($event);
    }

    public function it_updates_an_event_with_new_author(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        FormFactory $formFactory,
        Arg $arguments,
        User $viewer,
        Form $form,
        Event $event,
        Publisher $publisher,
        AuthorizationCheckerInterface $authorizationChecker,
        User $newAuthor
    ) {
        $values = [
            'id' => 'base64id',
            'customCode' => 'abc',
            'startAt' => '2050-02-03 10:00:00',
            'translations' => [
                [
                    'locale' => 'fr-FR',
                    'body' => 'My body',
                ],
            ],
            'author' => 'abc',
            'animator' => 'def',
        ];

        $viewer->isAdmin()->willReturn(true);
        $viewer->isProjectAdmin()->willReturn(true);
        $arguments->getArrayCopy()->willReturn($values);
        $globalIdResolver->resolve('base64id', $viewer)->willReturn($event);
        $event->getId()->willReturn('event1');
        $event->setStartAt(new DateTime('2050-02-03 10:00:00'))->willReturn($event);

        $globalIdResolver->resolve($values['author'], $viewer)->willReturn($newAuthor);
        $event->getAuthor()->willReturn(null);
        $event->setAuthor($newAuthor)->shouldBeCalled();

        $formFactory->create(EventType::class, $event)->willReturn($form);
        $form
            ->submit(
                [
                    'customCode' => 'abc',
                    'translations' => ['fr-FR' => ['locale' => 'fr-FR', 'body' => 'My body']],
                ],
                false
            )
            ->willReturn(null);
        $form->isValid()->willReturn(true);
        $em->flush()->shouldBeCalled();
        $authorizationChecker->isGranted('edit', Argument::type(Event::class))->willReturn(true);
        $publisher->publish('event.update', Argument::type(Message::class))->shouldNotBeCalled();

        $payload = $this->__invoke($arguments, $viewer);
        $payload->shouldHaveCount(2);
        $payload['userErrors']->shouldBe([]);
        $payload['event']->shouldBe($event);
    }

    public function it_try_to_persists_new_event_with_customCode_as_user(
        Arg $arguments,
        User $viewer
    ) {
        $values = ['body' => 'My body', 'customCode' => 'abc'];
        $viewer->getId()->willReturn('iMTheAuthor');
        $viewer->getUsername()->willReturn('My username is toto');
        $viewer->isAdmin()->willReturn(false);
        $viewer->isProjectAdmin()->willReturn(false);

        $arguments->getArrayCopy()->willReturn($values);
        $this->__invoke($arguments, $viewer)->shouldBe([
            'eventEdge' => null,
            'userErrors' => [['message' => 'You are not authorized to add customCode field.']],
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
                    'body' => 'New body',
                ],
            ],
        ];

        $viewer->isAdmin()->willReturn(false);
        $viewer->isProjectAdmin()->willReturn(false);
        $arguments->getArrayCopy()->willReturn($values);

        $reviewer->isAdmin()->willReturn(true);
        $reviewer->getId()->willReturn('reviewer');

        $eventReview->getReviewer()->willReturn($reviewer);
        $eventReview->getStatus()->willReturn(EventReviewStatusType::REFUSED);

        $event->getReview()->willReturn($eventReview);
        $event->getStatus()->willReturn(EventReviewStatusType::REFUSED);

        $globalIdResolver->resolve('base64id', $viewer)->willReturn($event);
        $event->getId()->willReturn('event1');
        $event->setStartAt(new DateTime('2050-02-03 10:00:00'))->willReturn($event);
        $event->getAuthor()->willReturn($viewer);
        $event->setAuthor($viewer)->willReturn($event);

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

        $authorizationChecker->isGranted('edit', Argument::type(Event::class))->willReturn(true);
        $publisher->publish('event.update', Argument::type(Message::class))->shouldBeCalled();

        $payload = $this->__invoke($arguments, $viewer);
        $payload->shouldHaveCount(2);
        $payload['userErrors']->shouldBe([]);
        $payload['event']->shouldBe($event);
    }

    public function it_should_return_false_if_no_event_found(
        GlobalIdResolver $globalIdResolver,
        User $viewer
    ) {
        $eventId = 'abc';
        $globalIdResolver->resolve($eventId, $viewer)->willReturn(null);
        $this->isGranted($eventId, $viewer)->shouldReturn(false);
    }

    public function it_should_call_voter_if_event_found(
        GlobalIdResolver $globalIdResolver,
        User $viewer,
        Event $event,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $eventId = 'abc';
        $globalIdResolver->resolve($eventId, $viewer)->willReturn($event);
        $authorizationChecker
            ->isGranted(EventVoter::EDIT, $event)
            ->willReturn(true)
            ->shouldBeCalled();
        $this->isGranted($eventId, $viewer);
    }
}
