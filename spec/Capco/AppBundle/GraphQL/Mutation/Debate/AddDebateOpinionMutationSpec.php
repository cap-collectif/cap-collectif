<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateOpinion;
use Capco\AppBundle\Form\DebateOpinionType;
use Capco\AppBundle\GraphQL\Mutation\Debate\AddDebateOpinionMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\Form;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class AddDebateOpinionMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        GlobalIdResolver $globalIdResolver,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->beConstructedWith(
            $em,
            $formFactory,
            $logger,
            $globalIdResolver,
            $authorizationChecker
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(AddDebateOpinionMutation::class);
    }

    public function it_persists_new_opinion(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        FormFactoryInterface $formFactory,
        Arg $input,
        Form $form,
        Debate $debate
    ) {
        $debateId = '123';
        $input->offsetGet('debateId')->willReturn($debateId);
        $globalIdResolver->resolve($debateId, null)->willReturn($debate);

        $values = [
            'debateId' => $debateId,
            'title' => 'Opinion Title',
            'body' => 'Opinion Body',
            'author' => '123456',
        ];

        $form
            ->submit(
                [
                    'title' => 'Opinion Title',
                    'body' => 'Opinion Body',
                    'author' => '123456',
                ],
                false
            )
            ->willReturn(null)
        ;
        $form->isValid()->willReturn(true);

        $formFactory
            ->create(DebateOpinionType::class, Argument::type(DebateOpinion::class))
            ->willReturn($form)
        ;
        $input->getArrayCopy()->willReturn($values);

        $em->persist(Argument::type(DebateOpinion::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $payload = $this->__invoke($input);
        $payload->shouldHaveCount(2);
        $payload['errorCode']->shouldBe(null);
        $payload['debateOpinion']->shouldHaveType(DebateOpinion::class);
    }

    public function it_errors_on_invalid_id(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        FormFactoryInterface $formFactory,
        Arg $input,
        Form $form,
        Debate $debate
    ) {
        $debateId = '123';
        $input->offsetGet('debateId')->willReturn($debateId);
        $globalIdResolver->resolve($debateId, null)->willReturn(null);

        $payload = $this->__invoke($input);
        $payload->shouldHaveCount(2);
        $payload['errorCode']->shouldBe('UNKNOWN_DEBATE');
        $payload['debateOpinion']->shouldBe(null);
    }

    public function it_errors_on_invalid_form(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        FormFactoryInterface $formFactory,
        Arg $input,
        Form $form,
        LoggerInterface $logger,
        Debate $debate
    ) {
        $debateId = '123';
        $input->offsetGet('debateId')->willReturn($debateId);
        $globalIdResolver->resolve($debateId, null)->willReturn($debate);

        $values = [
            'title' => 'Opinion Title',
            'body' => 'Opinion Body',
            'author' => '123456',
        ];
        $input->getArrayCopy()->willReturn($values);

        $form->submit($values, false)->willReturn(null);
        $form->isValid()->willReturn(false);
        $form->getErrors()->willReturn([]);
        $form->all()->willReturn([]);
        $logger
            ->error('Invalid `DebateOpinionType` form data.', ['errors' => []])
            ->shouldBeCalled()
        ;
        $formFactory
            ->create(DebateOpinionType::class, Argument::type(DebateOpinion::class))
            ->willReturn($form)
        ;

        $payload = $this->__invoke($input);
        $payload->shouldHaveCount(2);
        $payload['errorCode']->shouldBe('INVALID_FORM');
        $payload['debateOpinion']->shouldBe(null);
    }
}
