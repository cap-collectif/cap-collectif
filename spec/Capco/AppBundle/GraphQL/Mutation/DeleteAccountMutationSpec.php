<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Enum\DeleteAccountType;
use Capco\AppBundle\EventListener\SoftDeleteEventListener;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalAuthorDataLoader;
use Capco\AppBundle\GraphQL\Mutation\DeleteAccountMutation;
use Capco\AppBundle\Anonymizer\AnonymizeUser;
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
use Capco\MediaBundle\Repository\MediaRepository;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\Common\EventManager;
use Doctrine\ORM\Query\Filter\SQLFilter;
use Doctrine\ORM\Query\FilterCollection;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use phpDocumentor\Reflection\Types\Void_;
use PhpSpec\ObjectBehavior;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Psr\Log\LoggerInterface;
use Sonata\MediaBundle\Provider\ImageProvider;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Translation\Translator;

class DeleteAccountMutationSpec extends ObjectBehavior
{
    const USER_ID = 'USER-ID';

    public function let(
        EntityManagerInterface $em,
        Translator $translator,
        UserRepository $userRepository,
        UserGroupRepository $groupRepository,
        UserManager $userManager,
        RedisStorageHelper $redisStorageHelper,
        ImageProvider $mediaProvider,
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
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        FilterCollection $filterCollection,
        SoftDeleteEventListener $softDeleteEventListener,
        EventManager $eventManager,
        User $user,
        AnonymizeUser $anonymizeUser
    ) {
        $em->getFilters()->willReturn($filterCollection);
        $em->getEventManager()->willReturn($eventManager);

        $eventManager
            ->getListeners()
            ->willReturn(['soft_delete_event' => $softDeleteEventListener]);

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
            $formFactory,
            $logger,
            $anonymizeUser
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
        $input = new Arg(['userId' => $encodeUserId, 'type' => DeleteAccountType::HARD]);

        $userRepository
            ->find(self::USER_ID)
            ->shouldBeCalledOnce()
            ->willReturn($user);

        $viewer
            ->isAdmin()
            ->shouldBeCalledOnce()
            ->willReturn(true);

        $viewer
            ->isSuperAdmin()
            ->shouldBeCalledOnce()
            ->willReturn(false);

        $user
            ->getId()
            ->shouldBeCalledOnce()
            ->willReturn(self::USER_ID);

        $user
            ->isSuperAdmin()
            ->shouldBeCalledOnce()
            ->willReturn(true);

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
        SQLFilter $sqlFilter
    ) {
        $encodeUserId = GlobalId::toGlobalId('User', self::USER_ID);
        $input = new Arg(['userId' => $encodeUserId, 'type' => DeleteAccountType::HARD]);

        $userRepository
            ->find(self::USER_ID)
            ->shouldBeCalledOnce()
            ->willReturn($user);

        $viewer
            ->isAdmin()
            ->shouldBeCalledOnce()
            ->willReturn(true);

        $viewer
            ->isSuperAdmin()
            ->shouldBeCalledOnce()
            ->willReturn(true);

        $user
            ->getId()
            ->shouldBeCalledOnce()
            ->willReturn(self::USER_ID);

        $user
            ->isSuperAdmin()
            ->shouldNotBeCalled()
            ->willReturn(true);

        $filterCollection
            ->isEnabled('softdeleted')
            ->shouldBeCalledOnce()
            ->willReturn(true);

        $filterCollection
            ->disable('softdeleted')
            ->shouldBeCalledOnce()
            ->willReturn($sqlFilter);

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(1);
        $payload['userId']->shouldBe($encodeUserId);
    }

    public function it_throws_exception_on_deletete_a_super_admin_account(
        User $viewer,
        UserRepository $userRepository
    ) {
        $encodeUserId = GlobalId::toGlobalId('User', self::USER_ID);
        $input = new Arg(['userId' => $encodeUserId]);

        $viewer
            ->isAdmin()
            ->shouldBeCalledOnce()
            ->willReturn(true);

        $userRepository
            ->find(self::USER_ID)
            ->shouldBeCalledOnce()
            ->willThrow(new UserError(DeleteAccountMutation::CANNOT_FIND_USER));

        $this->shouldThrow(UserError::class)->during('__invoke', [$input, $viewer]);
    }
}
