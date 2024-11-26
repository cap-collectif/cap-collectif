<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\SmsCredit;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Model\ModerableInterface;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\AppBundle\Repository\CASSSOConfigurationRepository;
use Capco\AppBundle\Repository\CommentRepository;
use Capco\AppBundle\Repository\ConsultationRepository;
use Capco\AppBundle\Repository\ContactFormRepository;
use Capco\AppBundle\Repository\Debate\DebateAnonymousArgumentRepository;
use Capco\AppBundle\Repository\Debate\DebateArticleRepository;
use Capco\AppBundle\Repository\DebateArgumentRepository;
use Capco\AppBundle\Repository\DebateOpinionRepository;
use Capco\AppBundle\Repository\DebateRepository;
use Capco\AppBundle\Repository\EmailingCampaignRepository;
use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\Repository\FollowerRepository;
use Capco\AppBundle\Repository\FranceConnectSSOConfigurationRepository;
use Capco\AppBundle\Repository\GlobalDistrictRepository;
use Capco\AppBundle\Repository\GroupRepository;
use Capco\AppBundle\Repository\MailingListRepository;
use Capco\AppBundle\Repository\MapTokenRepository;
use Capco\AppBundle\Repository\MediaRepository;
use Capco\AppBundle\Repository\MediaResponseRepository;
use Capco\AppBundle\Repository\MediatorRepository;
use Capco\AppBundle\Repository\MenuItemRepository;
use Capco\AppBundle\Repository\Oauth2SSOConfigurationRepository;
use Capco\AppBundle\Repository\OfficialResponseRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionTypeRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\AppBundle\Repository\Organization\OrganizationRepository;
use Capco\AppBundle\Repository\Organization\PendingOrganizationInvitationRepository;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\AppBundle\Repository\PostRepository;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Repository\ProposalAnalysisRepository;
use Capco\AppBundle\Repository\ProposalDistrictRepository;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\ProposalRevisionRepository;
use Capco\AppBundle\Repository\QuestionChoiceRepository;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Capco\AppBundle\Repository\ReplyAnonymousRepository;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\AppBundle\Repository\RequirementRepository;
use Capco\AppBundle\Repository\SectionCarrouselElementRepository;
use Capco\AppBundle\Repository\SmsCreditRepository;
use Capco\AppBundle\Repository\SmsOrderRepository;
use Capco\AppBundle\Repository\SourceRepository;
use Capco\AppBundle\Repository\UserGroupRepository;
use Capco\AppBundle\Repository\UserInviteRepository;
use Capco\AppBundle\Repository\ValueResponseRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Capco\UserBundle\Repository\UserTypeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class GlobalIdResolver
{
    private const AVAILABLE_TYPES = [
        'Post',
        'Event',
        'User',
        'Questionnaire',
        'Consultation',
        'MapToken',
        'Requirement',
        'ConsultationStep',
        'OtherStep',
        'QuestionnaireStep',
        'PresentationStep',
        'CollectStep',
        'SelectionStep',
        'RankingStep',
        'DebateStep',
        'Proposal',
        'ProposalRevision',
        'ProposalAnalysis',
        'Debate',
        'DebateOpinion',
        'DebateArgument',
        'DebateArticle',
        'SmsOrder',
        SmsCredit::RELAY_NODE_TYPE,
        'Question',
        'QuestionChoice',
        'Reply',
        'ContactForm',
        'Project',
        'Oauth2SSOConfiguration',
        'FranceConnectSSOConfiguration',
        'CASSSOConfiguration',
        'Comment',
        'Source',
        'Argument',
        'Opinion',
        'Version',
        'UserInvite',
        'MailingList',
        'EmailingCampaign',
        'OfficialResponse',
        'Group',
        'ValueResponse',
        'MediaResponse',
        'District',
        'Organization',
        'PendingOrganizationInvitation',
        'Participant',
        'Mediator',
        'Contributor',
        'SectionCarrouselElement',
        'Media',
    ];
    private readonly ContainerInterface $container;
    private readonly LoggerInterface $logger;
    private readonly EntityManagerInterface $entityManager;

    // since we are calling all repositories it is easier to directly inject the container instead of injecting all repositories one by one.
    public function __construct(
        ContainerInterface $container,
        LoggerInterface $logger,
        EntityManagerInterface $entityManager
    ) {
        $this->container = $container;
        $this->logger = $logger;
        $this->entityManager = $entityManager;
    }

    public function resolve(string $uuidOrGlobalId, $userOrAnon = null, ?\ArrayObject $context = null)
    {
        $skipVerification =
            $context
            && $context->offsetExists('disable_acl')
            && true === $context->offsetGet('disable_acl');

        $user = null;
        if (empty($uuidOrGlobalId)) {
            return null;
        }

        if ($userOrAnon instanceof User) {
            $user = $userOrAnon;
        }

        if ($user && $user->isProjectAdmin()) {
            // If user is an admin, we allow to retrieve softdeleted nodes
            if ($this->entityManager->getFilters()->isEnabled('softdeleted')) {
                $this->entityManager->getFilters()->disable('softdeleted');
            }
        }

        // We try to decode the global id
        $decodeGlobalId = self::getDecodedId($uuidOrGlobalId);

        if (
            \is_array($decodeGlobalId)
            && isset($decodeGlobalId['type'], $decodeGlobalId['id'])
            && \in_array($decodeGlobalId['type'], self::AVAILABLE_TYPES, true)
        ) {
            // Good news, it's a GraphQL Global id !
            $uuid = $decodeGlobalId['id'];
            $node = null;

            switch ($decodeGlobalId['type']) {
                case 'Post':
                    $node = $this->container->get(PostRepository::class)->find($uuid);

                    break;

                case 'Event':
                    $node = $this->container->get(EventRepository::class)->find($uuid);

                    break;

                case 'User':
                    $node = $this->container->get(UserRepository::class)->find($uuid);

                    break;

                case 'Questionnaire':
                    $node = $this->container->get(QuestionnaireRepository::class)->find($uuid);

                    break;

                case 'Consultation':
                    $node = $this->container->get(ConsultationRepository::class)->find($uuid);

                    break;

                case 'MapToken':
                    $node = $this->container->get(MapTokenRepository::class)->find($uuid);

                    break;

                case 'Requirement':
                    $node = $this->container->get(RequirementRepository::class)->find($uuid);

                    break;

                case 'ConsultationStep':
                case 'OtherStep':
                case 'QuestionnaireStep':
                case 'PresentationStep':
                case 'CollectStep':
                case 'SelectionStep':
                case 'RankingStep':
                case 'DebateStep':
                    $node = $this->container->get(AbstractStepRepository::class)->find($uuid);

                    break;

                case 'Proposal':
                    $node = $this->container->get(ProposalRepository::class)->find($uuid);

                    break;

                case 'ProposalRevision':
                    $node = $this->container->get(ProposalRevisionRepository::class)->find($uuid);

                    break;

                case 'ProposalAnalysis':
                    $node = $this->container->get(ProposalAnalysisRepository::class)->find($uuid);

                    break;

                case 'Debate':
                    $node = $this->container->get(DebateRepository::class)->find($uuid);

                    break;

                case 'DebateOpinion':
                    $node = $this->container->get(DebateOpinionRepository::class)->find($uuid);

                    break;

                case 'DebateArgument':
                    $node = $this->container->get(DebateArgumentRepository::class)->find($uuid);
                    if (!$node) {
                        $node = $this->container
                            ->get(DebateAnonymousArgumentRepository::class)
                            ->find($uuid)
                        ;
                    }

                    break;

                case 'DebateArticle':
                    $node = $this->container->get(DebateArticleRepository::class)->find($uuid);

                    break;

                case 'SmsOrder':
                    $node = $this->container->get(SmsOrderRepository::class)->find($uuid);

                    break;

                case SmsCredit::RELAY_NODE_TYPE:
                    $node = $this->container->get(SmsCreditRepository::class)->find($uuid);

                    break;

                case 'Question':
                    $node = $this->container->get(AbstractQuestionRepository::class)->find($uuid);

                    break;

                case 'QuestionChoice':
                    $node = $this->container->get(QuestionChoiceRepository::class)->find($uuid);

                    break;

                case 'Reply':
                    $node = $this->container->get(ReplyRepository::class)->find($uuid);

                    if (!$node) {
                        $node = $this->container->get(ReplyAnonymousRepository::class)->find($uuid);
                    }

                    break;

                case 'ContactForm':
                    $node = $this->container->get(ContactFormRepository::class)->find($uuid);

                    break;

                case 'Project':
                    $node = $this->container->get(ProjectRepository::class)->find($uuid);

                    break;

                case 'Oauth2SSOConfiguration':
                    $node = $this->container
                        ->get(Oauth2SSOConfigurationRepository::class)
                        ->find($uuid)
                    ;

                    break;

                case 'FranceConnectSSOConfiguration':
                    $node = $this->container
                        ->get(FranceConnectSSOConfigurationRepository::class)
                        ->find($uuid)
                    ;

                    break;

                case 'CASSSOConfiguration':
                    $node = $this->container
                        ->get(CASSSOConfigurationRepository::class)
                        ->find($uuid)
                    ;

                    break;

                case 'Comment':
                    $node = $this->container->get(CommentRepository::class)->find($uuid);

                    break;

                case 'Source':
                    $node = $this->container->get(SourceRepository::class)->find($uuid);

                    break;

                case 'Argument':
                    $node = $this->container->get(ArgumentRepository::class)->find($uuid);

                    break;

                case 'Opinion':
                    $node = $this->container->get(OpinionRepository::class)->find($uuid);

                    break;

                case 'Version':
                    $node = $this->container->get(OpinionVersionRepository::class)->find($uuid);

                    break;

                case 'UserInvite':
                    $node = $this->container->get(UserInviteRepository::class)->find($uuid);

                    break;

                case 'MailingList':
                    $node = $this->container->get(MailingListRepository::class)->find($uuid);

                    break;

                case 'EmailingCampaign':
                    $node = $this->container->get(EmailingCampaignRepository::class)->find($uuid);

                    break;

                case 'OfficialResponse':
                    $node = $this->container->get(OfficialResponseRepository::class)->find($uuid);

                    break;

                case 'Group':
                    $node = $this->container->get(GroupRepository::class)->find($uuid);

                    break;

                case 'ValueResponse':
                    $node = $this->container->get(ValueResponseRepository::class)->find($uuid);

                    break;

                case 'MediaResponse':
                    $node = $this->container->get(MediaResponseRepository::class)->find($uuid);

                    break;

                case 'District':
                    $node = $this->container->get(ProposalDistrictRepository::class)->find($uuid);
                    if (!$node) {
                        $node = $this->container
                            ->get(GlobalDistrictRepository::class)
                            ->find($uuid)
                        ;
                    }

                    break;

                case 'Organization':
                    $node = $this->container->get(OrganizationRepository::class)->find($uuid);

                    break;

                case 'PendingOrganizationInvitation':
                    $node = $this->container->get(PendingOrganizationInvitationRepository::class)->find($uuid);

                    break;

                case 'Participant':
                    $node = $this->container->get(ParticipantRepository::class)->find($uuid);

                    break;

                case 'Mediator':
                    $node = $this->container->get(MediatorRepository::class)->find($uuid);

                    break;

                case 'Contributor':
                    $node = $this->container->get(UserRepository::class)->find($uuid);

                    if (!$node) {
                        $node = $this->container->get(ParticipantRepository::class)->find($uuid);
                    }

                    break;

                case 'MenuItem':
                    $node = $this->container->get(MenuItemRepository::class)->find($uuid);

                    break;

                case 'UserType':
                    $node = $this->container->get(UserTypeRepository::class)->find($uuid);

                    break;

                case 'SectionCarrouselElement':
                    $node = $this->container->get(SectionCarrouselElementRepository::class)->find($uuid);

                    break;

                case 'Media':
                    $node = $this->container->get(MediaRepository::class)->find($uuid);

                    break;

                default:
                    break;
            }

            if (!$node) {
                $error = 'Could not resolve node with globalId ' . $uuid;
                $this->logger->warning($error);

                return null;
            }

            return $this->viewerCanSee($node, $user, $skipVerification) ? $node : null;
        }

        // Arf we could not decode, it's a legacy UUID
        $uuid = $uuidOrGlobalId;

        $node = null;
        $node = $this->container->get(OpinionRepository::class)->find($uuid);

        if (!$node) {
            $node = $this->container->get(OpinionVersionRepository::class)->find($uuid);
        }

        if (!$node) {
            $node = $this->container->get(OpinionTypeRepository::class)->find($uuid);
        }

        if (!$node) {
            $node = $this->container->get(ProposalFormRepository::class)->find($uuid);
        }

        if (!$node) {
            $node = $this->container->get(AbstractStepRepository::class)->find($uuid);
        }

        if (!$node) {
            $node = $this->container->get(ArgumentRepository::class)->find($uuid);
        }

        if (!$node) {
            $node = $this->container->get(FollowerRepository::class)->find($uuid);
        }

        if (!$node) {
            $node = $this->container->get(ProposalRevisionRepository::class)->find($uuid);
        }

        if (!$node) {
            $node = $this->container->get(UserGroupRepository::class)->find($uuid);
        }

        if (!$node) {
            $node = $this->container->get(ValueResponseRepository::class)->find($uuid);
        }

        // TODO remove me.
        if (!$node) {
            $node = $this->container->get(ProposalRepository::class)->find($uuid);
        }
        // TODO remove me.
        if (!$node) {
            $node = $this->container->get(AbstractQuestionRepository::class)->find($uuid);
        }
        // TODO remove me.
        if (!$node) {
            $node = $this->container->get(ReplyRepository::class)->find($uuid);
        }
        if (!$node) {
            $node = $this->container->get(GlobalDistrictRepository::class)->find($uuid);
        }
        if (!$node) {
            $node = $this->container->get(ProposalDistrictRepository::class)->find($uuid);
        }

        if (!$node) {
            $error = "Could not resolve node with uuid {$uuid}";
            $this->logger->warning($error);

            return null;
        }

        return $this->viewerCanSee($node, $user, $skipVerification) ? $node : null;
    }

    public function resolveTypeByIds(
        array $uuidOrGlobalIds,
        $userOrAnon,
        string $type,
        ?\ArrayObject $context = null
    ) {
        $skipVerification =
            $context
            && $context->offsetExists('disable_acl')
            && true === $context->offsetGet('disable_acl');

        $user = null;
        if (empty($uuidOrGlobalIds)) {
            return null;
        }

        if ($userOrAnon instanceof User) {
            $user = $userOrAnon;
        }

        if ($user && $user->isAdmin()) {
            // If user is an admin, we allow to retrieve softdeleted nodes
            if ($this->entityManager->getFilters()->isEnabled('softdeleted')) {
                $this->entityManager->getFilters()->disable('softdeleted');
            }
        }
        $decodeGlobalIds = [];
        foreach ($uuidOrGlobalIds as $uuidOrGlobalId) {
            // We try to decode the global id
            $decodeGlobalIds[] = self::getDecodedId($uuidOrGlobalId);
        }
        $uuids = [];
        foreach ($decodeGlobalIds as $decodeGlobalId) {
            if (\is_array($decodeGlobalId)) {
                // Good news, it's a GraphQL Global id !
                $uuids[] = $decodeGlobalId['id'];
            }
        }
        if (!empty($uuids)) {
            $node = null;

            switch ($type) {
                case 'Proposal':
                    $node = $this->container->get(ProposalRepository::class)->findById($uuids);

                    break;

                case 'User':
                    $node = $this->container->get(UserRepository::class)->findById($uuids);

                    break;

                default:
                    break;
            }
            if (!$node) {
                $error = 'Could not resolve node with globalIds ' . var_export($uuids, true);
                $this->logger->warning($error);

                return null;
            }

            $viewerCanSee = true;
            foreach ($node as $item) {
                $viewerCanSee = $this->viewerCanSee($item, $user, $skipVerification);
            }

            return $viewerCanSee ? $node : null;
        }
        $uuids = $decodeGlobalIds;
        $node = $this->container->get(ProposalRepository::class)->findById($uuids);
        if (!$node) {
            $node = $this->container->get(UserRepository::class)->findById($uuids);
        }
        if (!$node) {
            $error = 'Could not resolve node with uuids ' . var_export($uuids, true);
            $this->logger->warning($error);

            return null;
        }
        $viewerCanSee = true;
        foreach ($node as $item) {
            $viewerCanSee = $this->viewerCanSee($item, $user, $skipVerification);
        }

        return $viewerCanSee ? $node : null;
    }

    public static function getDecodedId(string $uuidOrGlobalId, bool $returnId = false)
    {
        // We try to decode the global id
        $decodeGlobalId = GlobalId::fromGlobalId($uuidOrGlobalId);
        if (
            isset($decodeGlobalId['type'], $decodeGlobalId['id'])
            && null !== $decodeGlobalId['id']
        ) {
            return $returnId ? $decodeGlobalId['id'] : $decodeGlobalId;
        }

        return $uuidOrGlobalId;
    }

    public function resolveByModerationToken(string $token): ModerableInterface
    {
        $moderableRepositories = [
            OpinionRepository::class,
            OpinionVersionRepository::class,
            ArgumentRepository::class,
            CommentRepository::class,
            ProposalRepository::class,
            SourceRepository::class,
            DebateArgumentRepository::class,
        ];

        foreach ($moderableRepositories as $repository) {
            $node = $this->container->get($repository)->findOneByModerationToken($token);
            if ($node) {
                return $node;
            }
        }

        $this->logger->warning(__METHOD__ . ' : Unknown moderation_token: ' . $token);

        throw new NotFoundHttpException();
    }

    private function viewerCanSee($node, ?User $user, bool $skipVerification): bool
    {
        $projectContributionClass = [
            Project::class,
            Proposal::class,
            Comment::class,
            Argument::class,
            Source::class,
            Post::class,
            ProposalForm::class,
            Event::class,
            AbstractStep::class,
        ];

        foreach ($projectContributionClass as $object) {
            if ($skipVerification) {
                return true;
            }

            if ($node instanceof Proposal) {
                return $node->viewerCanSee($user);
            }
            if ($node instanceof $object) {
                return $node->canDisplay($user);
            }
        }

        return true;
    }
}
