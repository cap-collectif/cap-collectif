<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\ProposalForm;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Form\ProposalFormCreateType;
use Capco\AppBundle\GraphQL\Mutation\ProposalForm\CreateProposalFormMutation;
use Capco\AppBundle\Logger\ActionLogger;
use Capco\AppBundle\Resolver\SettableOwnerResolver;
use Capco\Tests\phpspec\MockHelper\GraphQLMock;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as OverblogGraphQLArgument;
use Overblog\GraphQLBundle\Error\UserError;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
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
        AuthorizationCheckerInterface $authorizationChecker,
        ActionLogger $actionLogger
    ) {
        $this->beConstructedWith($formFactory, $em, $settableOwnerResolver, $authorizationChecker, $actionLogger);
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
        OverblogGraphQLArgument $args,
        User $viewer,
        ActionLogger $actionLogger
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
            ->create(ProposalFormCreateType::class, Argument::any())
            ->willReturn($form)
        ;
        unset($input['owner']);
        $form->submit($input, false)->shouldBeCalled();
        $form
            ->isValid()
            ->shouldBeCalled()
            ->willReturn(true)
        ;
        $em->persist(Argument::type(ProposalForm::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();
        $settableOwnerResolver
            ->__invoke(null, $viewer)
            ->shouldBeCalled()
            ->willReturn($viewer)
        ;

        $actionLogger->logGraphQLMutation(Argument::any(), Argument::any(), Argument::any(), Argument::any(), Argument::any())->willReturn(true);

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
        OverblogGraphQLArgument $args,
        User $viewer,
        Organization $organization,
        ActionLogger $actionLogger
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
            ->create(ProposalFormCreateType::class, Argument::any())
            ->willReturn($form)
        ;
        unset($input['owner']);
        $form->submit($input, false)->shouldBeCalled();
        $form
            ->isValid()
            ->shouldBeCalled()
            ->willReturn(true)
        ;
        $em->persist(Argument::type(ProposalForm::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();
        $settableOwnerResolver
            ->__invoke($organizationId, $viewer)
            ->shouldBeCalled()
            ->willReturn($organization)
        ;

        $actionLogger->logGraphQLMutation(Argument::any(), Argument::any(), Argument::any(), Argument::any(), Argument::any())->willReturn(true);

        $response = $this->__invoke($args, $viewer);
        $response['proposalForm']->shouldHaveType(ProposalForm::class);
        $response['proposalForm']->getOwner()->shouldReturn($organization);
        $response['proposalForm']->getCreator()->shouldReturn($viewer);
    }

    public function it_throws_on_invalid_input(
        FormFactoryInterface $formFactory,
        EntityManagerInterface $em,
        FormInterface $form,
        OverblogGraphQLArgument $args,
        User $viewer,
        ActionLogger $actionLogger
    ): void {
        $title = 'title';
        $input = ['title' => $title];

        $this->getMockedGraphQLArgumentFormatted($args);
        $args->getArrayCopy()->willReturn($input);

        $formFactory
            ->create(ProposalFormCreateType::class, Argument::any())
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
        $actionLogger->logGraphQLMutation(Argument::any(), Argument::any(), Argument::any(), Argument::any(), Argument::any())->shouldNotBeCalled();

        $this->shouldThrow(UserError::class)->during('__invoke', [$args, $viewer]);
    }
}
