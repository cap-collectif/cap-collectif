<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\NotificationsConfiguration\ProposalFormNotificationConfiguration;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\PostTranslation;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Form\ProposalPostType;
use Capco\AppBundle\GraphQL\Error\BaseProposalError;
use Capco\AppBundle\GraphQL\Mutation\AddProposalNewsMutation;
use Capco\AppBundle\GraphQL\Resolver\Post\PostUrlResolver;
use Capco\AppBundle\Repository\LocaleRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Prophecy\Argument;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\Form;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Proposal;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Symfony\Contracts\Translation\TranslatorInterface;

class AddProposalNewsMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        GlobalIdResolver $globalIdResolver,
        LoggerInterface $logger,
        TranslatorInterface $translator,
        LocaleRepository $localeRepository,
        Publisher $publisher,
        PostUrlResolver $urlResolver
    ) {
        $this->beConstructedWith(
            $em,
            $formFactory,
            $globalIdResolver,
            $logger,
            $translator,
            $localeRepository,
            $publisher,
            $urlResolver
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(AddProposalNewsMutation::class);
    }

    public function it_returns_userError_if_not_found(
        GlobalIdResolver $globalIdResolver,
        Arg $arguments,
        User $viewer
    ) {
        $arguments->offsetGet('proposalId')->willReturn('123456');
        $globalIdResolver->resolve('123456', $viewer)->willReturn(null);
        $payload = $this->__invoke($arguments, $viewer);
        $payload['errorCode']->shouldBe('PROPOSAL_NOT_FOUND');
    }

    public function it_returns_userError_if_access_denied(
        GlobalIdResolver $globalIdResolver,
        Arg $arguments,
        User $viewer,
        User $proposalAuthor,
        Proposal $proposal
    ) {
        $proposalAuthor->getId()->willReturn('proposalAuthor');
        $proposal->getAuthor()->willReturn($proposalAuthor);
        $viewer->getId()->willReturn('viewer');
        $viewer->isAdmin()->willReturn(false);
        $arguments->offsetGet('proposalId')->willReturn('123456');
        $globalIdResolver->resolve('123456', $viewer)->willReturn($proposal);
        $payload = $this->__invoke($arguments, $viewer);
        $payload['errorCode']->shouldBe('ACCESS_DENIED');
    }

    public function it_returns_userError_if_step_dont_allow_news(
        GlobalIdResolver $globalIdResolver,
        Arg $arguments,
        User $viewer,
        Project $project,
        CollectStep $currentStep,
        Proposal $proposal
    ) {
        $proposal->getAuthor()->willReturn($viewer);
        $proposal->isProposalAuthorAllowedToAddNews()->willReturn(false);
        $proposal->getProject()->willReturn($project);
        $viewer->getId()->willReturn('viewer');
        $viewer->isAdmin()->willReturn(false);
        $arguments->offsetGet('proposalId')->willReturn('123456');
        $globalIdResolver->resolve('123456', $viewer)->willReturn($proposal);

        $project->getCurrentStep()->willReturn(null);
        $payload = $this->__invoke($arguments, $viewer);
        $payload['errorCode']->shouldBe('PROPOSAL_DOESNT_ALLOW_NEWS');

        $project->getCurrentStep()->willReturn($currentStep);
        $payload = $this->__invoke($arguments, $viewer);
        $payload['errorCode']->shouldBe('PROPOSAL_DOESNT_ALLOW_NEWS');
    }

    public function it_persists_new_proposal_news_and_send_notification(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        FormFactoryInterface $formFactory,
        Arg $arguments,
        User $viewer,
        Project $project,
        CollectStep $currentStep,
        Proposal $proposal,
        Post $proposalPost,
        PostTranslation $proposalPostTranslation,
        LocaleRepository $localeRepository,
        ProposalForm $proposalForm,
        Form $form,
        ProposalFormNotificationConfiguration $config,
        Publisher $publisher,
        PostUrlResolver $urlResolver
    ) {
        $this->mockData(
            $em,
            $globalIdResolver,
            $formFactory,
            $arguments,
            $viewer,
            $project,
            $currentStep,
            $proposal,
            $proposalPost,
            $proposalPostTranslation,
            $localeRepository,
            $proposalForm,
            $form,
            $config,
            $urlResolver
        );
        $proposalPost->getId()->WillReturn('123456');
        $config->isOnProposalNewsCreate()->willReturn(true);
        $publisher
            ->publish(\Prophecy\Argument::any(), Argument::type(Message::class))
            ->shouldBeCalled();

        $payload = $this->__invoke($arguments, $viewer);

        $payload['errorCode']->shouldBe(null);
        $payload['proposalPost']->shouldHaveType(Post::class);
        $payload['proposal']->shouldHaveType(Proposal::class);
        $payload['postURL']->shouldBe('http://capco.dev/project/step/proposal/blog/ticket');
    }

    public function it_persists_new_proposal_news_and_dont_send_notification(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        FormFactoryInterface $formFactory,
        Arg $arguments,
        User $viewer,
        Project $project,
        CollectStep $currentStep,
        Proposal $proposal,
        Post $proposalPost,
        PostTranslation $proposalPostTranslation,
        LocaleRepository $localeRepository,
        ProposalForm $proposalForm,
        Form $form,
        ProposalFormNotificationConfiguration $config,
        Publisher $publisher,
        PostUrlResolver $urlResolver
    ) {
        $this->mockData(
            $em,
            $globalIdResolver,
            $formFactory,
            $arguments,
            $viewer,
            $project,
            $currentStep,
            $proposal,
            $proposalPost,
            $proposalPostTranslation,
            $localeRepository,
            $proposalForm,
            $form,
            $config,
            $urlResolver
        );

        $config->isOnProposalNewsCreate()->willReturn(false);
        $proposalPost->getId()->WillReturn('123456');

        $publisher
            ->publish(\Prophecy\Argument::any(), Argument::type(Message::class))
            ->shouldNotBeCalled();

        $payload = $this->__invoke($arguments, $viewer);

        $payload['errorCode']->shouldBe(null);
        $payload['proposalPost']->shouldHaveType(Post::class);
        $payload['proposal']->shouldHaveType(Proposal::class);
        $payload['postURL']->shouldBe('http://capco.dev/project/step/proposal/blog/ticket');
    }

    private function mockData(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        FormFactoryInterface $formFactory,
        Arg $arguments,
        User $viewer,
        Project $project,
        CollectStep $currentStep,
        Proposal $proposal,
        Post $proposalPost,
        PostTranslation $proposalPostTranslation,
        LocaleRepository $localeRepository,
        ProposalForm $proposalForm,
        Form $form,
        ProposalFormNotificationConfiguration $config,
        PostUrlResolver $urlResolver
    ) {
        $viewer->getId()->willReturn('viewer');
        $viewer->isAdmin()->willReturn(false);
        $viewer->hasRole('ROLE_USER')->willReturn(true);

        $proposalForm->getNotificationsConfiguration()->willReturn($config);
        $proposal->getProposalForm()->willReturn($proposalForm);
        $proposal->getAuthor()->willReturn($viewer);
        $proposal->isProposalAuthorAllowedToAddNews()->willReturn(true);
        $project->getCurrentStep()->willReturn($currentStep);
        $proposal->getProject()->willReturn($project);

        $arguments->offsetGet('proposalId')->willReturn('123456');
        $globalIdResolver->resolve('123456', $viewer)->willReturn($proposal);
        $proposalPost->getAuthors()->willReturn(new ArrayCollection([$viewer->getWrappedObject()]));
        $proposalPost->getUpdatedAt()->willReturn(Argument::type(\DateTime::class));
        $proposalPost->isDisplayedOnBlog()->willReturn(false);
        $proposalPost->getThemes()->willReturn(new ArrayCollection([]));
        $proposalPost
            ->translate()
            ->getObjectProphecy()
            ->getSlug()
            ->willReturn('blog-ticket');
        $proposalPost
            ->getTranslations()
            ->willReturn(new ArrayCollection([$proposalPostTranslation->getWrappedObject()]));
        $proposalPost
            ->getProposals()
            ->willReturn(new ArrayCollection([$proposal->getWrappedObject()]));

        $translation = [
            'fr-FR' => [
                'locale' => 'fr-FR',
                'title' > 'Mon titre',
                'body' => '<script>alert("My body");</script>',
                'abstract' => 'My abstract',
            ],
        ];
        $values = [
            'proposalId' => '123456',
            'translations' => $translation,
        ];

        $formData = [
            'translations' => $translation,
        ];

        $urlResolver
            ->__invoke(Argument::type(Post::class))
            ->willReturn('http://capco.dev/project/step/proposal/blog/ticket');
        $form->submit($formData, false)->willReturn(null);
        $form->isValid()->willReturn(true);
        $formFactory
            ->create(ProposalPostType::class, Argument::type(Post::class))
            ->willReturn($form);
        $arguments->getArrayCopy()->willReturn($values);
        $localeRepository->findEnabledLocalesCodes()->willReturn(['fr-FR']);

        $em->persist(Argument::type(Post::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();
    }
}
