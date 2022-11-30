<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Resolver\SettableOwnerResolver;
use Capco\AppBundle\Security\EventVoter;
use Prophecy\Argument;
use PhpSpec\ObjectBehavior;
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
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Component\Translation\Translator;

class AddEventMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        FormFactoryInterface $formFactory,
        Indexer $indexer,
        Publisher $publisher,
        AuthorizationCheckerInterface $authorizationChecker,
        Translator $translator,
        SettableOwnerResolver $settableOwnerResolver,
        LocaleRepository $localeRepository
    ) {
        $localeRepository->findEnabledLocalesCodes()->willReturn(['fr-FR']);
        $this->beConstructedWith(
            $em,
            $globalIdResolver,
            $formFactory,
            $indexer,
            $publisher,
            $authorizationChecker,
            $translator,
            $settableOwnerResolver,
            $localeRepository
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
        SettableOwnerResolver $settableOwnerResolver,
        Publisher $publisher
    ) {
        $values = [
            'startAt' => '2019-04-09T22:00:23.000',
            'translations' => [
                [
                    'locale' => 'fr-FR',
                    'body' => 'My body',
                    'title' => 'title',
                    'metaDescription' => 'metaDescription',
                    'link' => 'link',
                ],
            ],
        ];

        $event->getBody()->willReturn('My body');
        $viewer->getId()->willReturn('iMTheAuthor');
        $viewer->getUsername()->willReturn('My username is toto');
        $viewer->isAdmin()->willReturn(false);
        $viewer->isSuperAdmin()->willReturn(false);
        $viewer->isProjectAdmin()->willReturn(false);
        $viewer->isOnlyUser()->willReturn(true);
        $viewer->isOrganizationMember()->willReturn(false);

        $event->getAuthor()->willReturn($viewer);

        $form
            ->submit(
                [
                    'translations' => [
                        'fr-FR' => [
                            'locale' => 'fr-FR',
                            'body' => 'My body',
                            'title' => 'title',
                            'metaDescription' => 'metaDescription',
                            'link' => 'link',
                        ],
                    ],
                ],
                false
            )
            ->willReturn(null);
        $form->isValid()->willReturn(true);

        $formFactory->create(EventType::class, Argument::type(Event::class))->willReturn($form);
        $arguments->getArrayCopy()->willReturn($values);
        $arguments
            ->offsetGet('owner')
            ->shouldBeCalled()
            ->willReturn(null);

        $em->persist(Argument::type(Event::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        // we cant moke ID with phpSpec, but in reality there is an ID
        $indexer->index(Event::class, null)->shouldBeCalled();
        $indexer->finishBulk()->shouldBeCalled();

        $publisher
            ->publish('event.create', \Prophecy\Argument::type(Message::class))
            ->shouldBeCalled();

        $settableOwnerResolver
            ->__invoke(null, $viewer)
            ->shouldBeCalled()
            ->willReturn($viewer);

        $payload = $this->__invoke($arguments, $viewer);
        $payload->shouldHaveCount(2);
        $payload['userErrors']->shouldBe([]);
        $payload['eventEdge']->shouldHaveType(Edge::class);
        $payload['eventEdge']->node->shouldHaveType(Event::class);
        $payload['eventEdge']->node->getAuthor()->shouldBe($viewer);
    }

    public function it_persists_new_event_with_given_author(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        Arg $arguments,
        User $viewer,
        Form $form,
        Indexer $indexer,
        Event $event,
        GlobalIdResolver $globalIdResolver,
        SettableOwnerResolver $settableOwnerResolver,
        User $author
    ) {
        $values = [
            'startAt' => '2019-04-09T22:00:23.000',
            'translations' => [
                [
                    'locale' => 'fr-FR',
                    'body' => 'My body',
                ],
            ],
            'author' => 'abc',
        ];

        $event->getBody()->willReturn('My body');
        $viewer->getId()->willReturn('iMTheAuthor');
        $viewer->getUsername()->willReturn('My username is toto');
        $viewer->isAdmin()->willReturn(true);
        $viewer->isProjectAdmin()->willReturn(false);
        $viewer->isOnlyUser()->willReturn(false);

        $globalIdResolver->resolve($values['author'], $viewer)->willReturn($author);

        $event->getAuthor()->willReturn($author);

        $form
            ->submit(
                ['translations' => ['fr-FR' => ['locale' => 'fr-FR', 'body' => 'My body']]],
                false
            )
            ->willReturn(null);
        $form->isValid()->willReturn(true);

        $formFactory->create(EventType::class, Argument::type(Event::class))->willReturn($form);
        $arguments->getArrayCopy()->willReturn($values);
        $arguments
            ->offsetGet('owner')
            ->shouldBeCalled()
            ->willReturn(null);

        $em->persist(Argument::type(Event::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        // we cant moke ID with phpSpec, but in reality there is an ID
        $indexer->index(Event::class, null)->shouldBeCalled();
        $indexer->finishBulk()->shouldBeCalled();

        $settableOwnerResolver
            ->__invoke(null, $viewer)
            ->shouldBeCalled()
            ->willReturn($viewer);

        $payload = $this->__invoke($arguments, $viewer);
        $payload->shouldHaveCount(2);
        $payload['userErrors']->shouldBe([]);
        $payload['eventEdge']->shouldHaveType(Edge::class);
        $payload['eventEdge']->node->shouldHaveType(Event::class);
        $payload['eventEdge']->node->getAuthor()->shouldBe($author);
    }

    public function it_try_to_persists_new_event_with_customCode_as_user(
        Arg $arguments,
        User $viewer
    ) {
        $values = [
            'customCode' => 'abc',
            'startAt' => '2019-04-09T22:00:23.000',
            'translations' => [
                [
                    'locale' => 'fr-FR',
                    'body' => 'My body',
                ],
            ],
        ];
        $viewer->getId()->willReturn('iMTheAuthor');
        $viewer->getUsername()->willReturn('My username is toto');
        $viewer->isAdmin()->willReturn(false);
        $viewer->isSuperAdmin()->willReturn(false);
        $viewer->isProjectAdmin()->willReturn(false);
        $viewer->isOnlyUser()->willReturn(true);

        $arguments->getArrayCopy()->willReturn($values);
        $payload = $this->__invoke($arguments, $viewer);
        $payload->shouldHaveCount(2);
        $payload['userErrors']->shouldBe([
            ['message' => 'You are not authorized to add customCode field.'],
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
        SettableOwnerResolver $settableOwnerResolver,
        Event $event
    ) {
        $values = [
            'customCode' => 'abc',
            'startAt' => '2019-04-09T22:00:23.000',
            'translations' => [
                [
                    'locale' => 'fr-FR',
                    'body' => 'My body',
                ],
            ],
        ];

        $event->getBody()->willReturn('My body');
        $viewer->getId()->willReturn('iMTheAuthor');
        $viewer->getUsername()->willReturn('My username is toto');
        $viewer->isAdmin()->willReturn(true);
        $viewer->isProjectAdmin()->willReturn(true);
        $viewer->isOnlyUser()->willReturn(false);

        $event->getAuthor()->willReturn($viewer);

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

        $formFactory->create(EventType::class, Argument::type(Event::class))->willReturn($form);
        $arguments->getArrayCopy()->willReturn($values);
        $arguments
            ->offsetGet('owner')
            ->shouldBeCalled()
            ->willReturn(null);

        $em->persist(Argument::type(Event::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        // we cant moke ID with phpSpec, but in reality there is an ID
        $indexer->index(Event::class, null)->shouldBeCalled();
        $indexer->finishBulk()->shouldBeCalled();

        $settableOwnerResolver
            ->__invoke(null, $viewer)
            ->shouldBeCalled()
            ->willReturn($viewer);

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
        SettableOwnerResolver $settableOwnerResolver,
        Event $event
    ) {
        $values = [
            'startAt' => '2019-04-09T22:00:23.000',
            'translations' => [
                [
                    'locale' => 'fr-FR',
                    'body' => '',
                ],
            ],
        ];
        $arguments->getArrayCopy()->willReturn($values);
        $arguments
            ->offsetGet('owner')
            ->shouldBeCalled()
            ->willReturn(null);

        $viewer->getId()->willReturn('iMTheAuthor');
        $viewer->getUsername()->willReturn('My username is toto');
        $viewer->isAdmin()->willReturn(false);
        $viewer->isProjectAdmin()->willReturn(false);
        $viewer->isOnlyUser()->willReturn(false);

        $event->setAuthor($viewer)->willReturn($event);
        $event->getAuthor()->willReturn($viewer);

        $settableOwnerResolver
            ->__invoke(null, $viewer)
            ->shouldBeCalled()
            ->willReturn($viewer);

        $error->getMessage()->willReturn('Invalid data.');
        $form->getErrors()->willReturn([$error]);
        $form->all()->willReturn([]);
        $form->isValid()->willReturn(false);
        $form
            ->submit(['translations' => ['fr-FR' => ['locale' => 'fr-FR', 'body' => '']]], false)
            ->willReturn(null);
        $form->getExtraData()->willReturn([]);

        $formFactory->create(EventType::class, Argument::type(Event::class))->willReturn($form);
        $this->shouldThrow(GraphQLException::fromString('Invalid data.'))->during('__invoke', [
            $arguments,
            $viewer,
        ]);
    }

    public function it_should_call_voter(AuthorizationCheckerInterface $authorizationChecker)
    {
        $authorizationChecker
            ->isGranted(EventVoter::CREATE, Argument::type(Event::class))
            ->shouldBeCalled()
            ->willReturn(true);
        $this->isGranted()->shouldReturn(true);
    }
}
