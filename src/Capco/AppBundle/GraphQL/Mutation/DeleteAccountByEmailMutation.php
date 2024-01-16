<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Anonymizer\UserAnonymizer;
use Capco\AppBundle\Enum\DeleteAccountByEmailErrorCode;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalAuthorDataLoader;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
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
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Psr\Log\LoggerInterface;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Contracts\Translation\TranslatorInterface;

class DeleteAccountByEmailMutation extends BaseDeleteUserMutation
{
    use MutationTrait;

    private UserRepository $userRepository;

    public function __construct(
        EntityManagerInterface $em,
        TranslatorInterface $translator,
        UserRepository $userRepository,
        UserGroupRepository $groupRepository,
        UserManager $userManager,
        RedisStorageHelper $redisStorageHelper,
        MediaProvider $mediaProvider,
        ProposalAuthorDataLoader $proposalAuthorDataLoader,
        LoggerInterface $logger,
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
        UserAnonymizer $userAnonymiser,
        Publisher $publisher
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
            $userAnonymiser,
            $publisher
        );
        $this->userRepository = $userRepository;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $this->formatInput($input);
        $user = $viewer;
        $email = $input->offsetGet('email');

        if (isset($email)) {
            $user = $this->userRepository->findOneByEmail($email);
            if (!$user) {
                return ['errorCode' => DeleteAccountByEmailErrorCode::NON_EXISTING_EMAIL];
            }
            if ($user->hasRole(User::ROLE_SUPER_ADMIN)) {
                return ['errorCode' => DeleteAccountByEmailErrorCode::DELETION_DENIED];
            }
            $email = $user->getEmail();
        }

        try {
            $this->hardDeleteUserContributionsInActiveSteps($user);
        } catch (Exception $e) {
            $this->logger->error($e->getMessage(), ['context' => 'delete_user_account_by_email']);

            throw new UserError("An error occured during user's contributions deletion");
        }
        //in order not to reference dead relationships between entities
        $this->em->refresh($user);

        try {
            $this->userAnonymizer->anonymize($user);
            $this->em->refresh($user);
            $this->softDeleteContents($user);
            $this->em->flush();
        } catch (Exception $e) {
            $this->logger->error($e->getMessage(), ['context' => 'delete_user_account_by_email']);

            throw new UserError("An error occured during the user's anonymization");
        }

        return ['email' => $email];
    }
}
