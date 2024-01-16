<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\NotificationsConfiguration\ProposalFormNotificationConfiguration;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\GraphQL\Mutation\DeleteProposalNewsMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalUrlResolver;
use Capco\Tests\phpspec\MockHelper\GraphQLMock;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\HttpFoundation\RequestStack;

class DeleteProposalNewsMutationSpec extends ObjectBehavior
{
    use GraphQLMock;

    public function let(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        LoggerInterface $logger,
        Publisher $publisher,
        ProposalUrlResolver $proposalUrlResolver,
        RequestStack $requestStack
    ) {
        $this->beConstructedWith(
            $em,
            $globalIdResolver,
            $logger,
            $publisher,
            $proposalUrlResolver,
            $requestStack
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(DeleteProposalNewsMutation::class);
    }

    public function it_returns_userError_if_not_found(
        GlobalIdResolver $globalIdResolver,
        Arg $arguments,
        User $viewer
    ) {
        $arguments->offsetGet('postId')->willReturn('123456');
        $this->getMockedGraphQLArgumentFormatted($arguments);

        $globalIdResolver->resolve('123456', $viewer)->willReturn(null);
        $payload = $this->__invoke($arguments, $viewer);
        $payload['errorCode']->shouldBe(DeleteProposalNewsMutation::POST_NOT_FOUND);
    }

    public function it_returns_userError_if_access_denied(
        GlobalIdResolver $globalIdResolver,
        Arg $arguments,
        User $viewer,
        User $proposalAuthor,
        Proposal $proposal,
        Post $post
    ) {
        $proposalAuthor->getId()->willReturn('proposalAuthor');
        $proposal->getAuthor()->willReturn($proposalAuthor);
        $viewer->getId()->willReturn('viewer');
        $viewer->isAdmin()->willReturn(false);
        $arguments->offsetGet('postId')->willReturn('123456');
        $this->getMockedGraphQLArgumentFormatted($arguments);

        $post->isAuthor($viewer)->willReturn(false);
        $globalIdResolver->resolve('123456', $viewer)->willReturn($post);
        $payload = $this->__invoke($arguments, $viewer);
        $payload['errorCode']->shouldBe(DeleteProposalNewsMutation::ACCESS_DENIED);
    }

    public function it_remove_proposal_news_and_send_notification(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        Arg $arguments,
        User $viewer,
        Proposal $proposal,
        Post $proposalNews,
        ProposalForm $proposalForm,
        ProposalFormNotificationConfiguration $configuration,
        Publisher $publisher,
        Project $project,
        ProposalUrlResolver $proposalUrlResolver,
        CollectStep $collectStep
    ) {
        $this->getMockedGraphQLArgumentFormatted($arguments);

        $this->mockData(
            $globalIdResolver,
            $arguments,
            $viewer,
            $proposal,
            $proposalNews,
            $proposalForm,
            $project,
            $collectStep
        );

        $proposalNews->getAuthorsObject()->willReturn(new ArrayCollection([$viewer->getWrappedObject()]));

        // we test this
        $configuration->isOnProposalNewsDelete()->willReturn(true);

        $proposalForm->getNotificationsConfiguration()->willReturn($configuration);
        $proposal->getProposalForm()->willReturn($proposalForm);
        $proposalUrlResolver
            ->__invoke($proposal, Argument::type(RequestStack::class))
            ->willReturn('test')
        ;

        $em->remove(Argument::type(Post::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $publisher
            ->publish(
                'proposal_news.delete',
                new Message(
                    json_encode([
                        'postId' => '123456',
                        'proposalName' => 'proposal title',
                        'projectName' => 'project title',
                        'postAuthor' => 'username',
                    ])
                )
            )
            ->shouldBeCalled()
        ;

        $payload = $this->__invoke($arguments, $viewer);

        $payload['errorCode']->shouldBe(null);
        $payload['postId']->shouldBe('123456');
        $payload['proposalUrl']->shouldBe('test');
    }

    public function it_persists_new_proposal_news_and_dont_send_notification(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        Arg $arguments,
        User $viewer,
        Proposal $proposal,
        Post $proposalNews,
        ProposalForm $proposalForm,
        ProposalFormNotificationConfiguration $configuration,
        Publisher $publisher,
        Project $project,
        ProposalUrlResolver $proposalUrlResolver,
        CollectStep $collectStep
    ) {
        $this->getMockedGraphQLArgumentFormatted($arguments);

        $this->mockData(
            $globalIdResolver,
            $arguments,
            $viewer,
            $proposal,
            $proposalNews,
            $proposalForm,
            $project,
            $collectStep
        );

        $proposalNews->getAuthorsObject()->willReturn(new ArrayCollection([$viewer->getWrappedObject()]));

        // we test this
        $configuration->isOnProposalNewsDelete()->willReturn(false);

        $proposalForm->getNotificationsConfiguration()->willReturn($configuration);
        $proposal->getProposalForm()->willReturn($proposalForm);
        $proposalUrlResolver
            ->__invoke($proposal, Argument::type(RequestStack::class))
            ->willReturn('test')
        ;
        $em->remove(Argument::type(Post::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $publisher
            ->publish(
                'proposal_news.delete',
                new Message(
                    json_encode([
                        'postId' => '123456',
                        'proposalName' => 'proposal title',
                        'projectName' => 'project title',
                        'postAuthor' => 'username',
                    ])
                )
            )
            ->shouldNotBeCalled()
        ;

        $payload = $this->__invoke($arguments, $viewer);

        $payload['errorCode']->shouldBe(null);
        $payload['postId']->shouldBe('123456');
        $payload['proposalUrl']->shouldBe('test');
    }

    private function mockData(
        GlobalIdResolver $globalIdResolver,
        Arg $arguments,
        User $viewer,
        Proposal $proposal,
        Post $proposalNews,
        ProposalForm $proposalForm,
        Project $project,
        CollectStep $collectStep
    ) {
        $viewer->getId()->willReturn('viewer');
        $viewer->isAdmin()->willReturn(false);
        $viewer->getDisplayName()->willReturn('username');
        $arguments->offsetGet('postId')->willReturn('123456');
        $globalIdResolver->resolve('123456', $viewer)->willReturn($proposalNews);
        $proposalNews->isAuthor($viewer)->willReturn(true);
        $proposalNews->getId()->willReturn('123456');
        $proposalNews->getAuthorsObject()->willReturn(new ArrayCollection([$viewer->getWrappedObject()]));

        $proposal->getProposalForm()->willReturn($proposalForm);
        $proposal->getTitle()->willReturn('proposal title');
        $project->getTitle()->willReturn('project title');
        $proposal->getProject()->willReturn($project);
        $collectStep->getProject()->willReturn($project);
        $collectStep->getSlug()->willReturn('step');
        $proposal->getStep()->willReturn($collectStep);
        $proposals = new ArrayCollection([$proposal->getWrappedObject()]);
        $proposalNews->getProposals()->willReturn($proposals);
        $proposal->getProposalForm()->willReturn($proposalForm);
    }
}
