<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\Form;
use Capco\AppBundle\Entity\Event;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Form\EventType;
use Symfony\Component\Form\FormFactory;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Capco\AppBundle\GraphQL\Mutation\ChangeEventMutation;
use Symfony\Component\Form\FormError;

class ChangeEventMutationSpec extends ObjectBehavior
{
    public function let(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        FormFactory $formFactory,
        LoggerInterface $logger
    ) {
        $this->beConstructedWith($globalIdResolver, $em, $formFactory, $logger);
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
        Event $event
    ) {
        $values = ['id' => 'base64id', 'body' => 'My body'];
        $arguments->getRawArguments()->willReturn($values);
        $globalIdResolver->resolve('base64id', $viewer)->willReturn($event);

        $formFactory->create(EventType::class, $event)->willReturn($form);
        $form->submit(['body' => 'My body'], false)->willReturn(null);
        $form->isValid()->willReturn(true);
        $em->flush()->shouldBeCalled();

        $payload = $this->__invoke($arguments, $viewer);
        $payload->shouldHaveCount(2);
        $payload['userErrors']->shouldBe([]);
        $payload['eventEdge']->shouldHaveType(Edge::class);
        $payload['eventEdge']->node->shouldBe($event);
    }

    public function it_resolve_userErrors_on_unknown_id(
        GlobalIdResolver $globalIdResolver,
        Arg $arguments,
        User $viewer
    ) {
        $values = ['id' => 'base64id', 'body' => 'My body'];
        $arguments->getRawArguments()->willReturn($values);
        $globalIdResolver->resolve('base64id', $viewer)->willReturn(null);
        $this->__invoke($arguments, $viewer)->shouldBe([
            'eventEdge' => null,
            'userErrors' => [['message' => 'Could not find your event.']],
        ]);
    }

    public function it_throws_error_on_invalid_form(
        GlobalIdResolver $globalIdResolver,
        Arg $arguments,
        FormFactory $formFactory,
        Form $form,
        FormError $error,
        User $viewer,
        Event $event
    ) {
        $values = ['id' => 'base64id', 'body' => ''];
        $arguments->getRawArguments()->willReturn($values);
        $globalIdResolver->resolve('base64id', $viewer)->willReturn($event);
        $formFactory->create(EventType::class, $event)->willReturn($form);

        $form->submit(['body' => ''], false)->willReturn(null);
        $error->getMessage()->willReturn('Invalid data.');
        $form->getErrors()->willReturn([$error]);
        $form->all()->willReturn([]);
        $form->isValid()->willReturn(false);

        $this->shouldThrow(GraphQLException::fromString('Invalid data.'))->during('__invoke', [
            $arguments,
            $viewer,
        ]);
    }
}
