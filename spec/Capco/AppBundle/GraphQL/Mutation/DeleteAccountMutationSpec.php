<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Anonymizer\UserAnonymizer;
use Capco\AppBundle\Enum\DeleteAccountType;
use Capco\AppBundle\EventListener\SoftDeleteEventListener;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalAuthorDataLoader;
use Capco\AppBundle\GraphQL\Mutation\DeleteAccountMutation;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Capco\AppBundle\Repository\CommentRepository;
use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\Repository\HighlightedContentRepository;
use Capco\AppBundle\Repository\MailingListRepository;
use Capco\AppBundle\Repository\MediaResponseRepository;
use Capco\AppBundle\Repository\NewsletterSubscriptionRepository;
use Capco\AppBundle\Repository\ProposalEvaluationRepository;
use Capco\AppBundle\Repository\ReportingRepository;
use Capco\AppBundle\Repository\UserGroupRepository;
use Capco\AppBundle\Repository\ValueResponseRepository;
use Capco\MediaBundle\Provider\MediaProvider;
use Capco\MediaBundle\Repository\MediaRepository;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\Common\EventManager;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query\Filter\SQLFilter;
use Doctrine\ORM\Query\FilterCollection;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use phpDocumentor\Reflection\Types\Void_;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\HttpFoundation\Session\Flash\FlashBag;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Translation\Translator;
use Translation\Bundle\Translator\TranslatorInterface;

class DeleteAccountMutationSpec extends ObjectBehavior
{
    public const USER_ID = 'USER-ID';

    public function let(
        EntityManagerInterface $em,
        Translator $translator,
        UserRepository $userRepository,
        UserGroupRepository $groupRepository,
        UserManager $userManager,
        RedisStorageHelper $redisStorageHelper,
        MediaProvider $mediaProvider,
        ProposalAuthorDataLoader $proposalAuthorDataLoader,
        CommentRepository $commentRepository,
        ProposalEvaluationRepository $proposalEvaluationRepository,
        AbstractResponseRepository $abstractResponseRepository,
        NewsletterSubscriptionRepository $newsletterSubscriptionRepository,
        MediaRepository $mediaRepository,
        MediaResponseRepository $mediaResponseRepository,
        ValueResponseRepository $valueResponseRepository,
        ReportingRepository $reportingRepository,
        EventRepository $eventRepository,
        HighlightedContentRepository $highlightedContentRepository,
        MailingListRepository $mailingListRepository,
        LoggerInterface $logger,
        FilterCollection $filterCollection,
        SoftDeleteEventListener $softDeleteEventListener,
        EventManager $eventManager,
        User $user,
        UserAnonymizer $userAnonymizer,
        Publisher $publisher,
        SessionInterface $session
    ) {
        $em->getFilters()->willReturn($filterCollection);
        $em->getEventManager()->willReturn($eventManager);

        $eventManager
            ->getListeners()
            ->willReturn(['soft_delete_event' => $softDeleteEventListener])
        ;

        $em->flush()->willReturn(Void_::class);
        $em->refresh($user)->willReturn(Void_::class);

        $user->getContributions()->willReturn([]);

        $reportingRepository->findBy(['Reporter' => $user])->willReturn([]);
        $eventRepository->findBy(['author' => $user])->willReturn([]);

        $this->beConstructedWith(
            $em,
            $translator,
            $userRepository,
            $groupRepository,
            $userManager,
            $redisStorageHelper,
            $mediaProvider,
            $proposalAuthorDataLoader,
            $commentRepository,
            $proposalEvaluationRepository,
            $abstractResponseRepository,
            $newsletterSubscriptionRepository,
            $mediaRepository,
            $mediaResponseRepository,
            $valueResponseRepository,
            $reportingRepository,
            $eventRepository,
            $highlightedContentRepository,
            $mailingListRepository,
            $logger,
            $userAnonymizer,
            $publisher,
            $session
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(DeleteAccountMutation::class);
    }

    public function it_should_not_delete_a_super_admin_account(
        User $user,
        User $viewer,
        UserRepository $userRepository
    ) {
        $encodeUserId = GlobalId::toGlobalId('User', self::USER_ID);
        $values = ['userId' => $encodeUserId, 'type' => DeleteAccountType::HARD];
        $rawInput['input'] = $values;
        $input = new Arg($rawInput);

        $user->getEmail()->willReturn('admin@test.com');

        $userRepository
            ->find(self::USER_ID)
            ->shouldBeCalledOnce()
            ->willReturn($user)
        ;

        $viewer
            ->isAdmin()
            ->shouldBeCalledOnce()
            ->willReturn(true)
        ;

        $viewer
            ->isSuperAdmin()
            ->shouldBeCalledOnce()
            ->willReturn(false)
        ;

        $user
            ->getId()
            ->shouldBeCalledOnce()
            ->willReturn(self::USER_ID)
        ;

        $user
            ->isSuperAdmin()
            ->shouldBeCalledOnce()
            ->willReturn(true)
        ;

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(2);
        $payload['errorCode']->shouldBe(DeleteAccountMutation::CANNOT_DELETE_SUPER_ADMIN);
        $payload['userId']->shouldBe($encodeUserId);
    }

    public function it_should_delete_a_super_admin_account(
        User $user,
        User $viewer,
        UserRepository $userRepository,
        FilterCollection $filterCollection,
        SQLFilter $sqlFilter,
        Session $session,
        TranslatorInterface $translator,
        FlashBag $flashBag
    ) {
        $encodeUserId = GlobalId::toGlobalId('User', self::USER_ID);

        $values = ['userId' => $encodeUserId, 'type' => DeleteAccountType::HARD];
        $rawInput['input'] = $values;
        $input = new Arg($rawInput);

        $user->getEmail()->willReturn('admin@test.com');

        $userRepository
            ->find(self::USER_ID)
            ->shouldBeCalledOnce()
            ->willReturn($user)
        ;

        $viewer
            ->isAdmin()
            ->shouldBeCalledOnce()
            ->willReturn(true)
        ;

        $viewer
            ->isSuperAdmin()
            ->shouldBeCalledOnce()
            ->willReturn(true)
        ;

        $user
            ->getId()
            ->shouldBeCalledOnce()
            ->willReturn(self::USER_ID)
        ;

        $user
            ->isSuperAdmin()
            ->shouldNotBeCalled()
            ->willReturn(true)
        ;

        $filterCollection
            ->isEnabled('softdeleted')
            ->shouldBeCalledOnce()
            ->willReturn(true)
        ;

        $filterCollection
            ->disable('softdeleted')
            ->shouldBeCalledOnce()
            ->willReturn($sqlFilter)
        ;

        $session->getFlashBag()
            ->shouldBeCalledOnce()
            ->willReturn($flashBag)
        ;

        $translator->trans('deleted-user', [], 'CapcoAppBundle')
            ->shouldBeCalledOnce()
            ->willReturn('deleted-user')
        ;

        $flashBag->add('success', 'deleted-user')
            ->shouldBeCalledOnce()
        ;

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(1);
        $payload['userId']->shouldBe($encodeUserId);
    }

    public function it_throws_exception_on_deletete_a_super_admin_account(
        User $viewer,
        UserRepository $userRepository
    ) {
        $encodeUserId = GlobalId::toGlobalId('User', self::USER_ID);
        $values = ['userId' => $encodeUserId, 'type' => DeleteAccountType::HARD];
        $rawInput['input'] = $values;
        $input = new Arg($rawInput);

        $viewer
            ->isAdmin()
            ->shouldBeCalledOnce()
            ->willReturn(true)
        ;

        $userRepository
            ->find(self::USER_ID)
            ->shouldBeCalledOnce()
            ->willThrow(new UserError(DeleteAccountMutation::CANNOT_FIND_USER))
        ;

        $this->shouldThrow(UserError::class)->during('__invoke', [$input, $viewer]);
    }
}
