<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\ProposalFormOwner;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\GraphQL\Resolver\ProposalFormOwner\ProposalFormOwnerProposalFormsResolver;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use PhpSpec\ObjectBehavior;

class ProposalFormOwnerProposalFormsResolverSpec extends ObjectBehavior
{
    public function let(ProposalFormRepository $repository): void
    {
        $this->beConstructedWith($repository);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(ProposalFormOwnerProposalFormsResolver::class);
    }

    public function it_return_owned_proposalForms(
        Argument $args,
        ProposalFormRepository $repository,
        ProposalForm $proposalForm,
        User $viewer
    ): void {
        $input = [
            'query' => null,
            'orderBy' => [
                'field' => 'CREATED_AT',
                'direction' => 'DESC',
            ],
            'affiliations' => ['OWNER'],
            'availableOnly' => false,
        ];
        $args->getArrayCopy()->willReturn($input);

        $args->offsetGet('query')->willReturn($input['query']);
        $args->offsetGet('orderBy')->willReturn($input['orderBy']);
        $args->offsetGet('affiliations')->willReturn($input['affiliations']);
        $args->offsetGet('availableOnly')->willReturn($input['availableOnly']);
        $args->offsetExists('last')->willReturn(false);
        $args->offsetExists('first')->willReturn(false);
        $args->offsetExists('after')->willReturn(false);

        $repository
            ->getAll(
                \Prophecy\Argument::any(),
                \Prophecy\Argument::any(),
                $input['affiliations'],
                $viewer,
                null,
                \Prophecy\Argument::any(),
                \Prophecy\Argument::any(),
                false
            )
            ->willReturn([$proposalForm])
        ;
        $repository->countAll($input['affiliations'], $viewer, null, false)->willReturn(1);

        $return = $this->__invoke($args, $viewer);
        $return->shouldHaveType(Connection::class);
        $return->shouldReturnConnection();
        $return->getTotalCount()->shouldBe(1);
        $return->getEdges()->shouldHaveCount(1);
    }

    public function it_throws_when_asking_all_proposalForms(Argument $args, User $viewer): void
    {
        $input = [
            'query' => null,
            'orderBy' => [
                'field' => 'CREATED_AT',
                'direction' => 'DESC',
            ],
            'affiliations' => [],
            'availableOnly' => false,
        ];
        $args->getArrayCopy()->willReturn($input);

        $args->offsetGet('query')->willReturn($input['query']);
        $args->offsetGet('orderBy')->willReturn($input['orderBy']);
        $args->offsetGet('affiliations')->willReturn($input['affiliations']);
        $args->offsetGet('availableOnly')->willReturn($input['availableOnly']);
        $args->offsetExists('last')->willReturn(false);
        $args->offsetExists('first')->willReturn(false);
        $args->offsetExists('after')->willReturn(false);

        $viewer->isAdmin()->willReturn(false);

        $return = $this->__invoke($args, $viewer);
        $return->shouldHaveType(Connection::class);
        $return->shouldReturnConnection();
        $return->getTotalCount()->shouldBe(0);
        $return->getEdges()->shouldHaveCount(0);
    }

    public function it_return_all_proposalForms_for_admin(
        Argument $args,
        ProposalFormRepository $repository,
        ProposalForm $proposalForm,
        User $viewer
    ): void {
        $input = [
            'query' => null,
            'orderBy' => [
                'field' => 'CREATED_AT',
                'direction' => 'DESC',
            ],
            'affiliations' => [],
            'availableOnly' => false,
        ];
        $args->getArrayCopy()->willReturn($input);

        $args->offsetGet('query')->willReturn($input['query']);
        $args->offsetGet('orderBy')->willReturn($input['orderBy']);
        $args->offsetGet('affiliations')->willReturn($input['affiliations']);
        $args->offsetGet('availableOnly')->willReturn($input['availableOnly']);
        $args->offsetExists('last')->willReturn(false);
        $args->offsetExists('first')->willReturn(false);
        $args->offsetExists('after')->willReturn(false);

        $viewer->isAdmin()->willReturn(true);

        $repository
            ->getAll(
                \Prophecy\Argument::any(),
                \Prophecy\Argument::any(),
                $input['affiliations'],
                $viewer,
                null,
                \Prophecy\Argument::any(),
                \Prophecy\Argument::any(),
                false
            )
            ->willReturn([$proposalForm])
        ;
        $repository->countAll($input['affiliations'], $viewer, null, false)->willReturn(1);

        $return = $this->__invoke($args, $viewer);
        $return->shouldHaveType(Connection::class);
        $return->shouldReturnConnection();
        $return->getTotalCount()->shouldBe(1);
        $return->getEdges()->shouldHaveCount(1);
    }
}
