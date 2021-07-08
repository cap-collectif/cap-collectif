<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\DBAL\Enum\ProposalRevisionStateType;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\ProposalRevision;
use Capco\AppBundle\Entity\ProposalSocialNetworks;
use Capco\AppBundle\Form\ProposalAdminType;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalLikersDataLoader;
use Capco\AppBundle\GraphQL\Mutation\ProposalMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Query\APIEnterprise\AutoCompleteDocQueryResolver;
use Capco\AppBundle\GraphQL\Resolver\Query\APIEnterprise\AutoCompleteFromSiretQueryResolver;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\DependencyInjection\Container;
use Symfony\Component\Form\Form;
use Symfony\Component\Form\FormFactory;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Form\FormFactoryInterface;

class ProposalMutationSpec extends ObjectBehavior
{
    public function let(
        LoggerInterface $logger,
        ProposalLikersDataLoader $proposalLikersDataLoader,
        GlobalIdResolver $globalIdResolver,
        Publisher $publisher,
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        Manager $manager,
        RedisCache $cache,
        AutoCompleteDocQueryResolver $autoCompleteDocQueryResolver,
        AutoCompleteFromSiretQueryResolver $autoCompleteFromSiretQueryResolver
    ) {
        $this->beConstructedWith(
            $logger,
            $proposalLikersDataLoader,
            $globalIdResolver,
            $publisher,
            $em,
            $formFactory,
            $manager,
            $cache,
            $autoCompleteDocQueryResolver,
            $autoCompleteFromSiretQueryResolver
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(ProposalMutation::class);
    }

    public function it_published_a_proposal_draft(
        Argument $input,
        User $author,
        EntityManagerInterface $em,
        FormFactory $formFactory,
        Proposal $proposal,
        Form $form,
        Indexer $indexer,
        Publisher $publisher,
        ProposalForm $proposalForm,
        Container $container,
        GlobalIdResolver $globalIdResolver,
        Manager $manager,
        ProposalSocialNetworks $proposalSocialNetworks,
        $wasDraft = true
    ) {
        $this->setContainer($container);

        $values = [];
        $values['id'] = 'UHJvcG9zYWwscHJvcG9zYWwyMQ==';
        $values['draft'] = false;
        $values['title'] = 'new title';
        $values['author'] = 'VXNlcix1c2VyNTAx';
        $user = $author;
        $container->get(Manager::class)->willReturn($manager);
        $manager->isActive(Manager::proposal_revisions)->willReturn(false);

        $author->getId()->willReturn('userSpyl');
        $author->getUsername()->willReturn('aUser');
        $author->isEmailConfirmed()->willReturn(true);
        $author->isAdmin()->willReturn(false);

        $input->getArrayCopy()->willReturn($values);

        $proposal->getId()->willReturn('proposal21');
        $proposal->isDraft()->willReturn(true);
        $proposal->getAuthor()->willReturn($author);
        $proposal->getPublishedAt()->willReturn(null);
        $proposal->isTrashed()->willReturn(false);
        $proposal->getTitle()->willReturn('Proposal in draft');
        $proposal->isInRevision()->willReturn(false);
        $proposal->canContribute($user)->willReturn(true);
        $proposal->setUpdateAuthor($author)->shouldBeCalled();
        $proposal->getUpdateAuthor()->willReturn($author);
        $proposal->getRevisions()->willReturn(new ArrayCollection());
        $proposal->getProposalForm()->willReturn($proposalForm);
        $proposal->getUpdatedAt()->willReturn(new \DateTime());

        $proposalForm->isUsingFacebook()->willReturn(false);
        $proposalForm->isUsingInstagram()->willReturn(false);
        $proposalForm->isUsingWebPage()->willReturn(false);
        $proposalForm->isUsingTwitter()->willReturn(false);
        $proposalForm->isUsingYoutube()->willReturn(false);
        $proposalForm->isUsingLinkedIn()->willReturn(false);

        $proposalSocialNetworks->getProposal()->willReturn($proposal);
        $proposal->getProposalSocialNetworks()->willReturn($proposalSocialNetworks);

        $globalIdResolver->resolve($values['id'], $user)->willReturn($proposal);

        // we set the proposal as non draft
        $proposal->setDraft(false)->shouldBeCalled();
        $proposal->setPublishedAt(\Prophecy\Argument::type(\DateTime::class))->shouldBeCalled();

        $container->get(Indexer::class)->willReturn($indexer);
        $container->get('swarrot.publisher')->willReturn($publisher);

        $formFactory
            ->create(ProposalAdminType::class, $proposal, [
                'proposalForm' => $proposalForm,
                'validation_groups' => ['Default'],
            ])
            ->willReturn($form);

        $form
            ->submit(
                [
                    'title' => 'new title',
                ],
                false
            )
            ->willReturn(null);
        $form->isValid()->willReturn(true);
        $proposal->setUpdatedAt(\Prophecy\Argument::type(\DateTime::class))->shouldBeCalled();

        $form->remove('author')->shouldBeCalled();

        $em->flush()->shouldBeCalled();

        $indexer
            ->index(ClassUtils::getClass($proposal->getWrappedObject()), 'proposal21')
            ->shouldBeCalled();
        $indexer->finishBulk()->shouldBeCalled();

        $this->changeContent($input, $user)->shouldBe(['proposal' => $proposal]);
    }

    public function it_change_content_from_revision_as_role_user(
        Argument $input,
        User $author,
        User $admin,
        EntityManagerInterface $em,
        FormFactory $formFactory,
        Proposal $proposal,
        Form $form,
        Indexer $indexer,
        Publisher $publisher,
        ProposalForm $proposalForm,
        Container $container,
        GlobalIdResolver $globalIdResolver,
        ProposalRevision $proposalRevision1,
        ProposalRevision $proposalRevision2,
        ProposalRevision $proposalRevision3,
        ProposalRevision $proposalRevision4,
        ProposalSocialNetworks $proposalSocialNetworks,
        Manager $manager,
        $wasDraft = false
    ) {
        $this->setContainer($container);

        $values = [];
        $values['id'] = GlobalId::toGlobalId('Proposal', 'proposal10');
        $values['draft'] = false;
        $values['title'] = 'new title';
        $values['author'] = 'VXNlcix1c2VyNTAx';
        $user = $author;
        $container->get(Manager::class)->willReturn($manager);
        $manager->isActive(Manager::proposal_revisions)->willReturn(false);
        $author->getId()->willReturn('userSpyl');
        $author->getUsername()->willReturn('aUser');
        $author->isEmailConfirmed()->willReturn(true);
        $author->isAdmin()->willReturn(false);
        $admin->getId()->willReturn('userMaxime');
        $admin->getUsername()->willReturn('aUser');
        $admin->isEmailConfirmed()->willReturn(true);
        $admin->isAdmin()->willReturn(true);

        $input->getArrayCopy()->willReturn($values);

        $now = new \DateTime();
        $proposalRevision1->getAuthor()->willReturn($admin);
        $proposalRevision1->getCreatedAt()->willReturn($now->modify('- 6 days'));
        $proposalRevision1->getExpiresAt()->willReturn($now->modify('+ 6 days'));
        $proposalRevision1->getReason()->willReturn('Ugly description');
        $proposalRevision1->getState()->willReturn(ProposalRevisionStateType::PENDING);
        $proposalRevision1->getProposal()->willReturn($proposal);
        $proposalRevision2->getAuthor()->willReturn($admin);
        $proposalRevision2->getCreatedAt()->willReturn($now->modify('- 10 days'));
        $proposalRevision2->getExpiresAt()->willReturn($now->modify('- 3 days'));
        $proposalRevision2->getReason()->willReturn('Revision expired');
        $proposalRevision2->getState()->willReturn(ProposalRevisionStateType::PENDING);
        $proposalRevision2->getProposal()->willReturn($proposal);
        $proposalRevision3->getAuthor()->willReturn($admin);
        $proposalRevision3->getCreatedAt()->willReturn($now->modify('- 10 days'));
        $proposalRevision3->getExpiresAt()->willReturn($now->modify('+ 3 days'));
        $proposalRevision3->getReason()->willReturn('Revision pending not expired');
        $proposalRevision3->getState()->willReturn(ProposalRevisionStateType::PENDING);
        $proposalRevision3->getProposal()->willReturn($proposal);
        $proposalRevision4->getAuthor()->willReturn($admin);
        $proposalRevision4->getCreatedAt()->willReturn($now->modify('- 10 days'));
        $proposalRevision4->getExpiresAt()->willReturn($now->modify('- 1 days'));
        $proposalRevision4->getReason()->willReturn('Revision revised');
        $proposalRevision4->getState()->willReturn(ProposalRevisionStateType::REVISED);
        $proposalRevision4->getProposal()->willReturn($proposal);

        $proposalRevisions = new ArrayCollection([
            $proposalRevision1,
            $proposalRevision2,
            $proposalRevision3,
            $proposalRevision4,
        ]);
        $proposal->getRevisions()->willReturn($proposalRevisions);

        $proposal->getId()->willReturn('proposal10');
        $proposal->isDraft()->willReturn(true);
        $proposal->getAuthor()->willReturn($author);
        $proposal->getPublishedAt()->willReturn(null);
        $proposal->isTrashed()->willReturn(false);
        $proposal->getTitle()->willReturn('Proposal in draft');
        $proposal->isInRevision()->willReturn(true);
        $proposal->canContribute($user)->willReturn(true);
        $proposal->setUpdateAuthor($author)->shouldBeCalled();
        $proposal->getUpdateAuthor()->willReturn($author);
        $proposal->getRevisions()->willReturn(new ArrayCollection());
        $proposal->getProposalForm()->willReturn($proposalForm);
        $proposal->getUpdatedAt()->willReturn(new \DateTime());

        $proposalForm->isUsingFacebook()->willReturn(false);
        $proposalForm->isUsingInstagram()->willReturn(false);
        $proposalForm->isUsingWebPage()->willReturn(false);
        $proposalForm->isUsingTwitter()->willReturn(false);
        $proposalForm->isUsingYoutube()->willReturn(false);
        $proposalForm->isUsingLinkedIn()->willReturn(false);

        $proposal->getProposalSocialNetworks()->willReturn($proposalSocialNetworks);
        $proposalSocialNetworks->getProposal()->willReturn($proposal);

        $globalIdResolver->resolve($values['id'], $user)->willReturn($proposal);

        // we set the proposal as non draft
        $proposal->setDraft(false)->shouldBeCalled();
        $proposal->setPublishedAt(\Prophecy\Argument::type(\DateTime::class))->shouldBeCalled();

        $container->get(Indexer::class)->willReturn($indexer);
        $container->get('swarrot.publisher')->willReturn($publisher);

        $formFactory
            ->create(ProposalAdminType::class, $proposal, [
                'proposalForm' => $proposalForm,
                'validation_groups' => ['Default'],
            ])
            ->willReturn($form);

        $form
            ->submit(
                [
                    'title' => 'new title',
                ],
                false
            )
            ->willReturn(null);
        $form->isValid()->willReturn(true);
        $proposal->setUpdatedAt(\Prophecy\Argument::type(\DateTime::class))->shouldBeCalled();

        $form->remove('author')->shouldBeCalled();

        $em->flush()->shouldBeCalled();

        $indexer
            ->index(ClassUtils::getClass($proposal->getWrappedObject()), 'proposal10')
            ->shouldBeCalled();
        $indexer->finishBulk()->shouldBeCalled();

        $this->changeContent($input, $user)->shouldBe(['proposal' => $proposal]);
    }

    public function it_change_content_as_role_admin(
        Argument $input,
        User $proposalAuthor,
        User $admin,
        EntityManagerInterface $em,
        FormFactory $formFactory,
        Proposal $proposal,
        Form $form,
        Indexer $indexer,
        Publisher $publisher,
        ProposalForm $proposalForm,
        Container $container,
        GlobalIdResolver $globalIdResolver,
        ProposalSocialNetworks $proposalSocialNetworks,
        Manager $manager
    ) {
        $this->setContainer($container);

        $values = [];
        $values['id'] = GlobalId::toGlobalId('Proposal', 'proposal10');
        $values['draft'] = false;
        $values['title'] = 'new title';
        $container->get(Manager::class)->willReturn($manager);
        $manager->isActive(Manager::proposal_revisions)->willReturn(false);
        $proposalAuthor->getId()->willReturn('userSpyl');
        $proposalAuthor->getUsername()->willReturn('aUser');
        $proposalAuthor->isEmailConfirmed()->willReturn(true);
        $proposalAuthor->isAdmin()->willReturn(false);

        $admin->getId()->willReturn('userMaxime');
        $admin->getUsername()->willReturn('aUser');
        $admin->isEmailConfirmed()->willReturn(true);
        $admin->isAdmin()->willReturn(true);

        $input->getArrayCopy()->willReturn($values);

        $proposal->getId()->willReturn('proposal10');
        $proposal->isDraft()->willReturn(false);
        $proposal->getAuthor()->willReturn($proposalAuthor);
        $proposal->getPublishedAt()->willReturn(new \DateTime());
        $proposal->isTrashed()->willReturn(false);
        $proposal->getTitle()->willReturn('Proposal modified by admin');
        $proposal->isInRevision()->willReturn(false);
        $proposal->canContribute($admin)->willReturn(true);
        $proposal->setUpdateAuthor($admin)->shouldBeCalled();
        $proposal->getUpdateAuthor()->willReturn($admin);
        $proposal->getRevisions()->willReturn(new ArrayCollection());
        $proposal->getProposalForm()->willReturn($proposalForm);
        $proposal->getUpdatedAt()->willReturn(new \DateTime());

        $proposalForm->isUsingFacebook()->willReturn(false);
        $proposalForm->isUsingInstagram()->willReturn(false);
        $proposalForm->isUsingWebPage()->willReturn(false);
        $proposalForm->isUsingTwitter()->willReturn(false);
        $proposalForm->isUsingYoutube()->willReturn(false);
        $proposalForm->isUsingLinkedIn()->willReturn(false);

        $proposal->getProposalSocialNetworks()->willReturn($proposalSocialNetworks);
        $proposalSocialNetworks->getProposal()->willReturn($proposal);

        $globalIdResolver->resolve($values['id'], $admin)->willReturn($proposal);

        $container->get(Indexer::class)->willReturn($indexer);
        $container->get('swarrot.publisher')->willReturn($publisher);

        $formFactory
            ->create(ProposalAdminType::class, $proposal, [
                'proposalForm' => $proposalForm,
                'validation_groups' => ['Default'],
            ])
            ->willReturn($form);
        $publisher
            ->publish(
                CapcoAppBundleMessagesTypes::PROPOSAL_UPDATE,
                \Prophecy\Argument::type(\Swarrot\Broker\Message::class)
            )
            ->shouldNotBeCalled();
        $form
            ->submit(
                [
                    'title' => 'new title',
                ],
                false
            )
            ->willReturn(null);
        $form->isValid()->willReturn(true);
        $proposal->setUpdatedAt(\Prophecy\Argument::type(\DateTime::class))->shouldNotBeCalled();

        $form->remove('author')->shouldNotBeCalled();

        $em->flush()->shouldBeCalled();

        $indexer
            ->index(ClassUtils::getClass($proposal->getWrappedObject()), 'proposal10')
            ->shouldBeCalled();
        $indexer->finishBulk()->shouldBeCalled();

        $this->changeContent($input, $admin)->shouldBe(['proposal' => $proposal]);
    }

    public function it_hydrate_social_networks(
        Proposal $proposal,
        ProposalForm $proposalForm,
        ProposalSocialNetworks $proposalSocialNetworks
    ) {
        $create = false;
        $values = [];

        $proposalSocialNetworks->getWebPageUrl()->willReturn('test');
        $proposalForm->isUsingWebPage()->willReturn(true);
        $proposalForm->isUsingFacebook()->willReturn(false);
        $proposalForm->isUsingTwitter()->willReturn(true);
        $proposalForm->isUsingInstagram()->willReturn(true);
        $proposalForm->isUsingLinkedIn()->willReturn(true);
        $proposalForm->isUsingYoutube()->willReturn(true);
        $proposalSocialNetworks->getProposal()->willReturn($proposal);
        $values['otherField'] = 'value';
        $values['webPageUrl'] = null;
        $values['facebookUrl'] = 'facebookUrl';
        $values['twitterUrl'] = 'twitterUrl';
        $values['instagramUrl'] = 'instagramUrl';
        $values['linkedInUrl'] = 'linkedInUrl';
        $values['youtubeUrl'] = 'youtubeUrl';

        $proposal->getProposalSocialNetworks()->willReturn(null);
        $proposal->setProposalSocialNetworks(\Prophecy\Argument::any())->willReturn($proposal);
        $this->hydrateSocialNetworks($values, $proposal, $proposalForm, $create)->shouldReturn([
            'otherField' => 'value',
        ]);

        $proposalSocialNetworks->setWebPageUrl(null)->shouldBeCalled();
        $proposalSocialNetworks->setFacebookUrl('facebookUrl')->shouldNotBeCalled();
        $proposalSocialNetworks->setTwitterUrl('twitterUrl')->shouldBeCalled();
        $proposalSocialNetworks->setInstagramUrl('instagramUrl')->shouldBeCalled();
        $proposalSocialNetworks->setLinkedInUrl('linkedInUrl')->shouldBeCalled();
        $proposalSocialNetworks->setYoutubeUrl('youtubeUrl')->shouldBeCalled();

        $proposal->getProposalSocialNetworks()->willReturn($proposalSocialNetworks);
        $this->hydrateSocialNetworks($values, $proposal, $proposalForm, $create)->shouldReturn([
            'otherField' => 'value',
        ]);
    }
}
