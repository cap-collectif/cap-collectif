<?php
namespace spec\Capco\AppBundle\GraphQL\Mutation;

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
use Capco\AppBundle\Entity\ProposalEvent;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Capco\AppBundle\GraphQL\Mutation\AddEventMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;

class AddEventMutationSpec extends ObjectBehavior
{
    function let(EntityManagerInterface $em, FormFactory $formFactory, LoggerInterface $logger)
    {
        $this->beConstructedWith($em, $formFactory, $logger);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType(AddEventMutation::class);
    }

    function it_persists_new_event(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        Arg $arguments,
        User $viewer,
        Form $form
    ) {
        $values = ["body" => "My body"];

        $form->submit($values, false)->willReturn(null);
        $form->isValid()->willReturn(true);

        $formFactory->create(EventType::class, Argument::type(Event::class))->willReturn($form);
        $arguments->getRawArguments()->willReturn($values);

        $em->persist(Argument::type(Event::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $payload = $this->__invoke($arguments, $viewer);
        $payload->shouldHaveCount(2);
        $payload['userErrors']->shouldBe([]);
        $payload['eventEdge']->shouldHaveType(Edge::class);
        $payload['eventEdge']->node->shouldHaveType(Event::class);
        $payload['eventEdge']->node->getAuthor()->shouldBe($viewer);
    }

    function it_throws_error_on_invalid_form(
        Arg $arguments,
        FormFactory $formFactory,
        Form $form,
        FormError $error,
        User $viewer,
        Event $event
    ) {
        $values = ["body" => ""];
        $arguments->getRawArguments()->willReturn($values);
        $formFactory->create(EventType::class, Argument::type(Event::class))->willReturn($form);
        
        $form->submit($values, false)->willReturn(null);
        $error->getMessage()->willReturn('Invalid data.');
        $form->getErrors()->willReturn([$error]);
        $form->all()->willReturn([]);
        $form->isValid()->willReturn(false);

        $this->shouldThrow(GraphQLException::fromString('Invalid data.'))->during(
            '__invoke',
            [$arguments, $viewer]
        );
    }
}
