<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\ProposalForm;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Form\ProposalFormCreateType;
use Capco\AppBundle\GraphQL\Mutation\ProposalForm\CreateProposalFormMutation;
use Capco\AppBundle\Resolver\SettableOwnerResolver;
use Capco\Tests\phpspec\MockHelper\GraphQLMock;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class CreateProposalFormMutationSpec extends ObjectBehavior
{
    use GraphQLMock;

    public function let(
        FormFactoryInterface $formFactory,
        EntityManagerInterface $em,
        SettableOwnerResolver $settableOwnerResolver,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->beConstructedWith($formFactory, $em, $settableOwnerResolver, $authorizationChecker);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(CreateProposalFormMutation::class);
    }

    public function it_creates_proposalForm(
        FormFactoryInterface $formFactory,
        EntityManagerInterface $em,
        SettableOwnerResolver $settableOwnerResolver,
        FormInterface $form,
        Argument $args,
        User $viewer
    ): void {
        $title = 'title';
        $input = ['title' => $title, 'owner' => null];
        $this->getMockedGraphQLArgumentFormatted($args);
        $args->getArrayCopy()->willReturn($input);

        $args
            ->offsetGet('owner')
            ->shouldBeCalled()
            ->willReturn(null)
        ;

        $formFactory
            ->create(ProposalFormCreateType::class, \Prophecy\Argument::any())
            ->willReturn($form)
        ;
        unset($input['owner']);
        $form->submit($input, false)->shouldBeCalled();
        $form
            ->isValid()
            ->shouldBeCalled()
            ->willReturn(true)
        ;
        $em->persist(\Prophecy\Argument::type(ProposalForm::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();
        $settableOwnerResolver
            ->__invoke(null, $viewer)
            ->shouldBeCalled()
            ->willReturn($viewer)
        ;

        $response = $this->__invoke($args, $viewer);
        $response['proposalForm']->shouldHaveType(ProposalForm::class);
        $response['proposalForm']->getOwner()->shouldReturn($viewer);
        $response['proposalForm']->getCreator()->shouldReturn($viewer);
    }

    public function it_creates_proposalForm_with_owner(
        FormFactoryInterface $formFactory,
        EntityManagerInterface $em,
        SettableOwnerResolver $settableOwnerResolver,
        FormInterface $form,
        Argument $args,
        User $viewer,
        Organization $organization
    ): void {
        $title = 'title';
        $organizationId = 'organizationId';
        $input = ['title' => $title, 'owner' => $organizationId];

        $this->getMockedGraphQLArgumentFormatted($args);
        $args->getArrayCopy()->willReturn($input);
        $args
            ->offsetGet('owner')
            ->shouldBeCalled()
            ->willReturn($organizationId)
        ;

        $formFactory
            ->create(ProposalFormCreateType::class, \Prophecy\Argument::any())
            ->willReturn($form)
        ;
        unset($input['owner']);
        $form->submit($input, false)->shouldBeCalled();
        $form
            ->isValid()
            ->shouldBeCalled()
            ->willReturn(true)
        ;
        $em->persist(\Prophecy\Argument::type(ProposalForm::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();
        $settableOwnerResolver
            ->__invoke($organizationId, $viewer)
            ->shouldBeCalled()
            ->willReturn($organization)
        ;

        $response = $this->__invoke($args, $viewer);
        $response['proposalForm']->shouldHaveType(ProposalForm::class);
        $response['proposalForm']->getOwner()->shouldReturn($organization);
        $response['proposalForm']->getCreator()->shouldReturn($viewer);
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

        $this->getMockedGraphQLArgumentFormatted($args);
        $args->getArrayCopy()->willReturn($input);

        $formFactory
            ->create(ProposalFormCreateType::class, \Prophecy\Argument::any())
            ->willReturn($form)
        ;
        $form->submit($input, false)->shouldBeCalled();
        $form
            ->isValid()
            ->shouldBeCalled()
            ->willReturn(false)
        ;
        $form->getErrors(true, false)->willReturn('ceci est une erreur');
        $em->flush()->shouldNotBeCalled();

        $this->shouldThrow(UserError::class)->during('__invoke', [$args, $viewer]);
    }
}
