<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\NotificationsConfiguration\ProposalFormNotificationConfiguration;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\PostTranslation;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Form\ProposalPostType;
use Capco\AppBundle\GraphQL\Mutation\UpdateProposalNewsMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Post\PostUrlResolver;
use Capco\AppBundle\Repository\LocaleRepository;
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
use Symfony\Component\Form\Form;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateProposalNewsMutationSpec extends ObjectBehavior
{
    use GraphQLMock;

    public function let(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        GlobalIdResolver $globalIdResolver,
        LoggerInterface $logger,
        Publisher $publisher,
        PostUrlResolver $urlResolver
    ) {
        $this->beConstructedWith(
            $em,
            $formFactory,
            $globalIdResolver,
            $logger,
            $publisher,
            $urlResolver
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(UpdateProposalNewsMutation::class);
    }

    public function it_returns_userError_if_not_found(
        GlobalIdResolver $globalIdResolver,
        Arg $arguments,
        User $viewer
    ) {
        $this->getMockedGraphQLArgumentFormatted($arguments);

        $arguments->offsetGet('postId')->willReturn('123456');
        $globalIdResolver->resolve('123456', $viewer)->willReturn(null);
        $payload = $this->__invoke($arguments, $viewer);
        $payload['errorCode']->shouldBe(UpdateProposalNewsMutation::POST_NOT_FOUND);
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
        $this->getMockedGraphQLArgumentFormatted($arguments);

        $arguments->offsetGet('postId')->willReturn('123456');
        $post->isAuthor($viewer)->willReturn(false);
        $globalIdResolver->resolve('123456', $viewer)->willReturn($post);
        $payload = $this->__invoke($arguments, $viewer);
        $payload['errorCode']->shouldBe(UpdateProposalNewsMutation::ACCESS_DENIED);
    }

    public function it_returns_userError_if_form_is_not_valid(
        GlobalIdResolver $globalIdResolver,
        Arg $arguments,
        User $viewer,
        Project $project,
        CollectStep $currentStep,
        Proposal $proposal,
        Form $form,
        FormFactoryInterface $formFactory,
        Post $post
    ) {
        $viewer->getId()->willReturn('viewer');
        $viewer->isAdmin()->willReturn(false);
        $this->getMockedGraphQLArgumentFormatted($arguments);

        $arguments->offsetGet('postId')->willReturn('123456');
        $globalIdResolver->resolve('123456', $viewer)->willReturn($post);
        $post->isAuthor($viewer)->willReturn(true);
        $translation = [
            'fr-FR' => [
                'locale' => 'fr-FR',
                'title' > 'Mon titre',
                'body' => '<script>alert("My body");</script>',
                'abstract' => 'My abstract',
            ],
        ];
        $values = [
            'postId' => '123456',
            'translations' => $translation,
        ];

        $formData = [
            'translations' => $translation,
        ];
        $form->submit($formData, false)->willReturn(null);
        $form->isValid()->willReturn(false);
        $formFactory
            ->create(ProposalPostType::class, Argument::type(Post::class))
            ->willReturn($form)
        ;
        $arguments->getArrayCopy()->willReturn($values);

        $payload = $this->__invoke($arguments, $viewer);
        $payload['errorCode']->shouldBe(UpdateProposalNewsMutation::INVALID_DATA);
    }

    public function it_persists_updated_proposal_news_and_send_notification(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        FormFactoryInterface $formFactory,
        Arg $arguments,
        User $viewer,
        Proposal $proposal,
        Post $proposalPost,
        PostTranslation $proposalPostTranslation,
        LocaleRepository $localeRepository,
        ProposalForm $proposalForm,
        Form $form,
        ProposalFormNotificationConfiguration $configuration,
        Publisher $publisher
    ) {
        $this->mockData(
            $em,
            $globalIdResolver,
            $formFactory,
            $arguments,
            $viewer,
            $proposal,
            $proposalPost,
            $proposalPostTranslation,
            $localeRepository,
            $proposalForm,
            $form,
            $configuration
        );

        $configuration->isOnProposalNewsUpdate()->willReturn(true);

        $publisher
            ->publish(\Prophecy\Argument::any(), Argument::type(Message::class))
            ->shouldBeCalled()
        ;

        $payload = $this->__invoke($arguments, $viewer);

        $payload['errorCode']->shouldBe(null);
        $payload['proposalPost']->shouldHaveType(Post::class);
    }

    public function it_persists_new_proposal_news_and_dont_send_notification(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        FormFactoryInterface $formFactory,
        Arg $arguments,
        User $viewer,
        Proposal $proposal,
        Post $proposalPost,
        PostTranslation $proposalPostTranslation,
        LocaleRepository $localeRepository,
        ProposalForm $proposalForm,
        Form $form,
        ProposalFormNotificationConfiguration $configuration,
        Publisher $publisher
    ) {
        $this->getMockedGraphQLArgumentFormatted($arguments);

        $this->mockData(
            $em,
            $globalIdResolver,
            $formFactory,
            $arguments,
            $viewer,
            $proposal,
            $proposalPost,
            $proposalPostTranslation,
            $localeRepository,
            $proposalForm,
            $form,
            $configuration
        );

        $configuration->isOnProposalNewsUpdate()->willReturn(false);

        $publisher
            ->publish(\Prophecy\Argument::any(), Argument::type(Message::class))
            ->shouldNotBeCalled()
        ;

        $payload = $this->__invoke($arguments, $viewer);

        $payload['errorCode']->shouldBe(null);
        $payload['proposalPost']->shouldHaveType(Post::class);
    }

    private function mockData(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        FormFactoryInterface $formFactory,
        Arg $arguments,
        User $viewer,
        Proposal $proposal,
        Post $proposalPost,
        PostTranslation $proposalPostTranslation,
        LocaleRepository $localeRepository,
        ProposalForm $proposalForm,
        Form $form,
        ProposalFormNotificationConfiguration $configuration
    ) {
        $viewer->getId()->willReturn('viewer');
        $viewer->isAdmin()->willReturn(false);
        $this->getMockedGraphQLArgumentFormatted($arguments);

        $arguments->offsetGet('postId')->willReturn('123456');
        $globalIdResolver->resolve('123456', $viewer)->willReturn($proposalPost);
        $proposalPost->isAuthor($viewer)->willReturn(true);
        $proposalPost->getId()->willReturn('123456');
        $proposals = new ArrayCollection([$proposal->getWrappedObject()]);
        $proposalPost->getProposals()->willReturn($proposals);
        $proposal->getProposalForm()->willReturn($proposalForm);

        $proposalForm->getNotificationsConfiguration()->willReturn($configuration);
        $proposal->getProposalForm()->willReturn($proposalForm);

        $proposalPost
            ->getTranslations()
            ->willReturn(new ArrayCollection([$proposalPostTranslation->getWrappedObject()]))
        ;

        $translation = [
            'fr-FR' => [
                'locale' => 'fr-FR',
                'title' > 'Mon titre',
                'body' => '<script>alert("My body");</script>',
                'abstract' => 'My abstract',
            ],
        ];
        $values = [
            'postId' => '123456',
            'translations' => $translation,
        ];

        $formData = [
            'translations' => $translation,
        ];

        $form->submit($formData, false)->willReturn(null);
        $form->isValid()->willReturn(true);
        $formFactory
            ->create(ProposalPostType::class, Argument::type(Post::class))
            ->willReturn($form)
        ;
        $arguments->getArrayCopy()->willReturn($values);
        $localeRepository->findEnabledLocalesCodes()->willReturn(['fr-FR']);
        $em->flush()->shouldBeCalled();
    }
}
