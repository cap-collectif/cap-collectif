<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Anonymizer\UserAnonymizer;
use Capco\AppBundle\Enum\DeleteAccountType;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalAuthorDataLoader;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Mailer\SendInBlue\SendInBluePublisher;
use Capco\AppBundle\Provider\MediaProvider;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Capco\AppBundle\Repository\CommentRepository;
use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\Repository\HighlightedContentRepository;
use Capco\AppBundle\Repository\MailingListRepository;
use Capco\AppBundle\Repository\MediaRepository;
use Capco\AppBundle\Repository\MediaResponseRepository;
use Capco\AppBundle\Repository\NewsletterSubscriptionRepository;
use Capco\AppBundle\Repository\ProposalEvaluationRepository;
use Capco\AppBundle\Repository\ReportingRepository;
use Capco\AppBundle\Repository\UserGroupRepository;
use Capco\AppBundle\Repository\ValueResponseRepository;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class DeleteAccountMutation extends BaseDeleteUserMutation
{
    use MutationTrait;

    public const CANNOT_DELETE_SUPER_ADMIN = 'CANNOT_DELETE_SUPER_ADMIN';
    public const CANNOT_FIND_USER = 'Can not find this userId !';

    private UserRepository $userRepository;
    private SessionInterface $session;

    public function __construct(
        EntityManagerInterface $em,
        TranslatorInterface $translator,
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
        UserAnonymizer $userAnonymizer,
        SessionInterface $session,
        SendInBluePublisher $sendInBluePublisher
    ) {
        parent::__construct(
            $em,
            $mediaProvider,
            $translator,
            $redisStorageHelper,
            $groupRepository,
            $userManager,
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
            $sendInBluePublisher
        );
        $this->userRepository = $userRepository;
        $this->session = $session;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $this->formatInput($input);
        $user = $this->getUser($input, $viewer);
        $userId = GlobalId::toGlobalId('User', $user->getId());
        if (!$viewer->isSuperAdmin() && $user->isSuperAdmin()) {
            return ['errorCode' => self::CANNOT_DELETE_SUPER_ADMIN, 'userId' => $userId];
        }

        $this->deleteAccount($input['type'], $user);

        $this->session
            ->getFlashBag()
            ->add('success', $this->translator->trans('deleted-user', [], 'CapcoAppBundle'))
        ;

        return ['userId' => $userId];
    }

    public function deleteAccount(string $deleteType, User $user): void
    {
        if (DeleteAccountType::HARD === $deleteType) {
            $this->hardDeleteUserContributionsInActiveSteps($user);
            $this->em->refresh($user);
            $this->softDeleteContents($user);
        }
        $this->anonymizeUser($user);
        $this->em->refresh($user);

        $this->em->flush();
    }

    private function getUser(Arg $input, User $viewer): User
    {
        $user = $viewer;

        if ($viewer->isAdmin() && isset($input['userId'])) {
            $userId = GlobalId::fromGlobalId($input['userId'])['id'];
            $user = $this->userRepository->find($userId);
            if (!$user) {
                throw new UserError(self::CANNOT_FIND_USER);
            }
        }

        return $user;
    }
}
