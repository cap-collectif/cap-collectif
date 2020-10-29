<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Debate;

use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\Form;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Form\DebateOpinionType;
use Capco\AppBundle\Entity\Debate\DebateOpinion;
use Symfony\Component\Form\FormFactoryInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\GraphQL\Mutation\Debate\UpdateDebateOpinionMutation;

class UpdateDebateOpinionMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        GlobalIdResolver $globalIdResolver
    ) {
        $this->beConstructedWith($em, $formFactory, $logger, $globalIdResolver);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(UpdateDebateOpinionMutation::class);
    }

    public function it_update_an_opinion(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        FormFactoryInterface $formFactory,
        Arg $input,
        Form $form,
        DebateOpinion $debateOpinion
    ) {
        $id = '123';
        $input->offsetGet('debateOpinionId')->willReturn($id);
        $globalIdResolver->resolve($id, null)->willReturn($debateOpinion);

        $values = [
            'debateOpinionId' => $id,
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
            ->willReturn(null);
        $form->isValid()->willReturn(true);

        $formFactory->create(DebateOpinionType::class, $debateOpinion)->willReturn($form);
        $input->getArrayCopy()->willReturn($values);

        $em->flush()->shouldBeCalled();

        $payload = $this->__invoke($input);
        $payload->shouldHaveCount(2);
        $payload['errorCode']->shouldBe(null);
        $payload['debateOpinion']->shouldBe($debateOpinion);
    }

    public function it_errors_on_invalid_id(GlobalIdResolver $globalIdResolver, Arg $input)
    {
        $id = '123';
        $input->offsetGet('debateOpinionId')->willReturn($id);
        $globalIdResolver->resolve($id, null)->willReturn(null);

        $payload = $this->__invoke($input);
        $payload->shouldHaveCount(2);
        $payload['errorCode']->shouldBe('UNKNOWN_DEBATE_OPINION');
        $payload['debateOpinion']->shouldBe(null);
    }

    public function it_errors_on_invalid_form(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        FormFactoryInterface $formFactory,
        Arg $input,
        Form $form,
        LoggerInterface $logger,
        DebateOpinion $debateOpinion
    ) {
        $id = '123';
        $input->offsetGet('debateOpinionId')->willReturn($id);
        $globalIdResolver->resolve($id, null)->willReturn($debateOpinion);

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
            ->shouldBeCalled();
        $formFactory->create(DebateOpinionType::class, $debateOpinion)->willReturn($form);

        $payload = $this->__invoke($input);
        $payload->shouldHaveCount(2);
        $payload['errorCode']->shouldBe('INVALID_FORM');
        $payload['debateOpinion']->shouldBe(null);
    }
}
