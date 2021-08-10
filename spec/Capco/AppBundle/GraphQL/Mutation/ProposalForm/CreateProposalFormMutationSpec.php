<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Form\ProposalFormCreateType;
use Capco\AppBundle\GraphQL\Mutation\ProposalForm\CreateProposalFormMutation;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;

class CreateProposalFormMutationSpec extends ObjectBehavior
{
    public function let(FormFactoryInterface $formFactory, EntityManagerInterface $em)
    {
        $this->beConstructedWith($formFactory, $em);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(CreateProposalFormMutation::class);
    }

    public function it_creates_proposalForm(
        FormFactoryInterface $formFactory,
        EntityManagerInterface $em,
        FormInterface $form,
        Argument $args,
        User $viewer
    ): void {
        $title = 'title';
        $input = ['title' => $title];
        $args->getArrayCopy()->willReturn($input);

        $formFactory
            ->create(ProposalFormCreateType::class, \Prophecy\Argument::any())
            ->willReturn($form);
        $form->submit($input, false)->shouldBeCalled();
        $form
            ->isValid()
            ->shouldBeCalled()
            ->willReturn(true);
        $em->persist(\Prophecy\Argument::type(ProposalForm::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $response = $this->__invoke($args, $viewer);
        $response['proposalForm']->shouldHaveType(ProposalForm::class);
        $response['proposalForm']->getOwner()->shouldReturn($viewer);
    }

    public function it_throws_on_invalid_input(
        FormFactoryInterface $formFactory,
        EntityManagerInterface $em,
        FormInterface $form,
        Argument $args,
        User $viewer
    ): void {
        $title = 'title';
        $input = ['title' => $title];
        $args->getArrayCopy()->willReturn($input);

        $formFactory
            ->create(ProposalFormCreateType::class, \Prophecy\Argument::any())
            ->willReturn($form);
        $form->submit($input, false)->shouldBeCalled();
        $form
            ->isValid()
            ->shouldBeCalled()
            ->willReturn(false);
        $form->getErrors(true, false)->willReturn('ceci est une erreur');
        $em->flush()->shouldNotBeCalled();

        $this->shouldThrow(UserError::class)->during('__invoke', [$args, $viewer]);
    }
}
