<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\ProposalSocialNetworks;
use Capco\AppBundle\GraphQL\Mutation\UpdateProposalSocialNetworksMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\Tests\phpspec\MockHelper\GraphQLMock;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;

class UpdateProposalSocialNetworksMutationSpec extends ObjectBehavior
{
    use GraphQLMock;

    public function let(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        LoggerInterface $logger
    ) {
        $this->beConstructedWith($em, $globalIdResolver, $logger);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(UpdateProposalSocialNetworksMutation::class);
    }

    public function it_returns_userError_if_not_found(
        GlobalIdResolver $globalIdResolver,
        Arg $arguments,
        User $viewer
    ) {
        $this->getMockedGraphQLArgumentFormatted($arguments);
        $arguments->offsetGet('proposalId')->willReturn('123456');
        $globalIdResolver->resolve('123456', $viewer)->willReturn(null);

        $this->__invoke($arguments, $viewer)->shouldBe([
            'errorCode' => 'PROPOSAL_NOT_FOUND',
        ]);
    }

    public function it_returns_userError_if_not_sociable(
        GlobalIdResolver $globalIdResolver,
        Arg $arguments,
        User $viewer,
        Proposal $proposal,
        ProposalForm $proposalForm
    ) {
        $proposalForm->isUsingAnySocialNetworks()->willReturn(false);
        $this->getMockedGraphQLArgumentFormatted($arguments);
        $arguments->offsetGet('proposalId')->willReturn('123456');
        $globalIdResolver->resolve('123456', $viewer)->willReturn($proposal);
        $proposal->getProposalForm()->willReturn($proposalForm);

        $this->__invoke($arguments, $viewer)->shouldBe([
            'errorCode' => 'PROPOSAL_DOESNT_ALLOW_SOCIAL_NETWORKS',
        ]);
    }

    public function it_returns_userError_if_viewer_is_not_author(
        GlobalIdResolver $globalIdResolver,
        Arg $arguments,
        User $viewer,
        User $author,
        Proposal $proposal,
        ProposalForm $proposalForm
    ) {
        $proposalForm->isUsingAnySocialNetworks()->willReturn(true);
        $this->getMockedGraphQLArgumentFormatted($arguments);
        $arguments->offsetGet('proposalId')->willReturn('123456');
        $globalIdResolver->resolve('123456', $viewer)->willReturn($proposal);
        $proposal->getProposalForm()->willReturn($proposalForm);
        $proposal->getAuthor()->willReturn($author);
        $proposal->isUserAuthor($viewer)->willReturn(false);
        $viewer->isAdmin()->willReturn(false);

        $this->__invoke($arguments, $viewer)->shouldBe([
            'errorCode' => 'ACCESS_DENIED',
        ]);
    }

    public function it_works(
        GlobalIdResolver $globalIdResolver,
        Arg $arguments,
        User $viewer,
        Proposal $proposal,
        ProposalForm $proposalForm,
        ProposalSocialNetworks $proposalSocialNetworks
    ) {
        $proposalForm->isUsingAnySocialNetworks()->willReturn(true);
        $proposalForm->isUsingFacebook()->willReturn(true);
        $proposalForm->isUsingWebPage()->willReturn(false);
        $proposalForm->isUsingInstagram()->willReturn(false);
        $proposalForm->isUsingTwitter()->willReturn(false);
        $proposalForm->isUsingYoutube()->willReturn(false);
        $proposalForm->isUsingLinkedIn()->willReturn(false);
        $this->getMockedGraphQLArgumentFormatted($arguments);
        $arguments->offsetGet('proposalId')->willReturn('123456');
        $globalIdResolver->resolve('123456', $viewer)->willReturn($proposal);
        $proposal->getProposalForm()->willReturn($proposalForm);
        $proposal->getAuthor()->willReturn($viewer);
        $proposal->isUserAuthor($viewer)->willReturn(true);
        $proposal->getProposalSocialNetworks()->willReturn($proposalSocialNetworks);
        $proposal->setProposalSocialNetworks($proposalSocialNetworks->getWrappedObject())->shouldBeCalled();
        $viewer->isAdmin()->willReturn(false);
        $arguments->getArrayCopy()->willReturn(['proposalId' => '123456', 'facebookUrl' => 'https://facebook.com/user']);
        $proposalSocialNetworks->setFacebookUrl('https://facebook.com/user')->shouldBeCalled();

        $this->__invoke($arguments, $viewer)->shouldBe(['proposal' => $proposal, 'errorCode' => null]);
    }
}
