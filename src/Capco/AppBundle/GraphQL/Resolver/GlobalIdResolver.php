<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Interfaces\ViewerPermissionInterface;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\SmsCredit;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Filter\ContributionCompletionStatusFilter;
use Capco\AppBundle\Model\ModerableInterface;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\AppBundle\Repository\CommentRepository;
use Capco\AppBundle\Repository\Debate\DebateAnonymousArgumentRepository;
use Capco\AppBundle\Repository\DebateArgumentRepository;
use Capco\AppBundle\Repository\FollowerRepository;
use Capco\AppBundle\Repository\GlobalDistrictRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionTypeRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalDistrictRepository;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\ProposalRevisionRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\AppBundle\Repository\SectionCarrouselElementRepository;
use Capco\AppBundle\Repository\SourceRepository;
use Capco\AppBundle\Repository\UserGroupRepository;
use Capco\AppBundle\Repository\ValueResponseRepository;
use Capco\Manager\RepositoryManager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
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
        'UserType',
        'Questionnaire',
        'Consultation',
        'MapToken',
        'Requirement',
        'ConsultationStep',
        'OtherStep',
        'QuestionnaireStep',
        'AbstractStep',
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
        'AbstractVote',
    ];

    private const CUSTOM_REPOSITORY_RESOLVER = [
        'DebateArgument',
        'Question',
        'Reply',
        'District',
        'Contributor',
        'SectionCarrouselElement',
        'Version',
    ];

    private const LEGACY_REPOSITORY = [
        OpinionRepository::class,
        OpinionVersionRepository::class,
        OpinionTypeRepository::class,
        ProposalFormRepository::class,
        AbstractStepRepository::class,
        ArgumentRepository::class,
        FollowerRepository::class,
        ProposalRevisionRepository::class,
        UserGroupRepository::class,
        ValueResponseRepository::class,
        ProposalRepository::class,
        AbstractQuestionRepository::class,
        ReplyRepository::class,
        GlobalDistrictRepository::class,
        ProposalDistrictRepository::class,
    ];

    private const LEGACY_NUMERICAL_ID_REPOSITORY = [
        ProposalSelectionVoteRepository::class,
        ProposalCollectVoteRepository::class,
    ];

    // since we are calling all repositories it is easier to directly inject the container instead of injecting all repositories one by one.
    public function __construct(
        private readonly ContainerInterface $container,
        private readonly LoggerInterface $logger,
        private readonly EntityManagerInterface $entityManager,
        private readonly RepositoryManager $repositoryManager
    ) {
    }

    public function resolve(string $uuidOrGlobalId, $userOrAnon = null, ?\ArrayObject $context = null)
    {
        $skipVerification =
            $context
            && $context->offsetExists('disable_acl')
            && true === $context->offsetGet('disable_acl');

        if (empty($uuidOrGlobalId)) {
            return null;
        }

        $user = null;

        if ($userOrAnon instanceof User) {
            $user = $userOrAnon;
        }

        if ($user && $user->isProjectAdmin()) {
            // If user is an admin, we allow to retrieve softdeleted nodes
            if ($this->entityManager->getFilters()->isEnabled('softdeleted')) {
                $this->entityManager->getFilters()->disable('softdeleted');
            }
        }

        if ($this->entityManager->getFilters()->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)) {
            $this->entityManager->getFilters()->disable(ContributionCompletionStatusFilter::FILTER_NAME);
        }

        // We try to decode the global id
        $decodeGlobalId = self::getDecodedId($uuidOrGlobalId);

        $node = $this->getNode($decodeGlobalId, $uuidOrGlobalId);

        if (!$this->entityManager->getFilters()->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)) {
            $this->entityManager->getFilters()->enable(ContributionCompletionStatusFilter::FILTER_NAME);
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

        if ($this->entityManager->getFilters()->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)) {
            $this->entityManager->getFilters()->disable(ContributionCompletionStatusFilter::FILTER_NAME);
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

        if (!$this->entityManager->getFilters()->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)) {
            $this->entityManager->getFilters()->enable(ContributionCompletionStatusFilter::FILTER_NAME);
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

        if ($node instanceof ViewerPermissionInterface) {
            return $node->viewerCanSee($user);
        }

        return true;
    }

    /**
     * @param array{type: string, id: string}|string $decodeGlobalId
     */
    private function getNode(array|string $decodeGlobalId, string $uuidGlobalId)
    {
        if (
            \is_array($decodeGlobalId)
            && isset($decodeGlobalId['type'], $decodeGlobalId['id'])
            && \in_array($decodeGlobalId['type'], self::AVAILABLE_TYPES, true)
        ) {
            $node = $this->getGraphQLId($decodeGlobalId);

            if (!$node) {
                $error = 'Could not resolve node with globalId ' . $decodeGlobalId['id'];
                $this->logger->warning($error);

                return null;
            }

            return $node;
        }

        return $this->getLegacyId($uuidGlobalId);
    }

    /**
     * @param array{type: string, id: string}|string $decodeGlobalId
     */
    private function getGraphQLId(array|string $decodeGlobalId)
    {
        $type = $decodeGlobalId['type'];

        $repository = $this->repositoryManager->get($type);

        $uuid = $decodeGlobalId['id'];

        if (null !== $repository && !class_exists($repository::class)) {
            return null;
        }

        if (is_subclass_of($repository, AbstractStepRepository::class)) {
            return $this->container->get(AbstractStepRepository::class)->find($uuid);
        }

        if (\in_array($type, self::CUSTOM_REPOSITORY_RESOLVER)) {
            return match ($type) {
                'DebateArgument' => $repository->find($uuid) ?? $this->container->get(DebateAnonymousArgumentRepository::class)->find($uuid),
                'Question' => $this->container->get(AbstractQuestionRepository::class)->find($uuid),
                'Reply' => $repository->find($uuid),
                'District' => $this->container->get(ProposalDistrictRepository::class)->find($uuid) ?? $this->container->get(GlobalDistrictRepository::class)->find($uuid),
                'Contributor' => $this->container->get(UserRepository::class)->find($uuid) ?? $this->container->get(ParticipantRepository::class)->find($uuid),
                'SectionCarrouselElement' => $this->container->get(SectionCarrouselElementRepository::class)->find($uuid),
                'Version' => $this->container->get(OpinionVersionRepository::class)->find($uuid),
                default => null,
            };
        }

        if (null === $repository) {
            return null;
        }

        return $repository->find($uuid);
    }

    private function getLegacyId(string $uuid)
    {
        $node = null;

        foreach (self::LEGACY_REPOSITORY as $repository) {
            $node = $this->container->get($repository)->find($uuid);

            if ($node) {
                return $node;
            }
        }

        foreach (self::LEGACY_NUMERICAL_ID_REPOSITORY as $repository) {
            if ($uuid == (int) $uuid) {
                $node = $this->container->get($repository)->find($uuid);
            }

            if ($node) {
                return $node;
            }
        }

        $error = "Could not resolve node with uuid {$uuid}";
        $this->logger->warning($error);

        return null;
    }
}
