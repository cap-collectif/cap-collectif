<?php

namespace Capco\AppBundle\GraphQL\Resolver\Questionnaire;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalViewerIsAnEvaluerResolver;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\AppBundle\Security\ProposalAnalysisRelatedVoter;
use Capco\AppBundle\Security\QuestionnaireVoter;
use Capco\AppBundle\Service\CapcoAnonReplyDecoder;
use Capco\AppBundle\Service\ParticipantAccessResolver;
use Capco\AppBundle\Service\ParticipantAuthentication;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\QueryBuilder;
use Elastica\Query\BoolQuery;
use Elastica\Query\Term;
use Elastica\Query\Terms;
use GraphQL\Type\Definition\ResolveInfo;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class QuestionnaireResultsAccessResolver implements QueryInterface
{
    private const AUTHORIZED_REPLIES = 'authorized_questionnaire_replies';

    public function __construct(
        private readonly AuthorizationCheckerInterface $authorizationChecker,
        private readonly ParticipantAccessResolver $participantAccessResolver,
        private readonly RequestStack $requestStack,
        private readonly QuestionnaireRepository $questionnaireRepository,
        private readonly ReplyRepository $replyRepository,
        private readonly CapcoAnonReplyDecoder $cookieDecoder,
        private readonly ParticipantAuthentication $participantAuthentication,
        private readonly ProposalViewerIsAnEvaluerResolver $legacyAnalystAccess
    ) {
    }

    public function canViewResults(?Questionnaire $questionnaire, ?\ArrayObject $context = null): bool
    {
        if (!$questionnaire) {
            return false;
        }

        if (true === ($context['disable_acl'] ?? false)) {
            return true;
        }

        $project = $questionnaire->getStep()?->getProject();

        return $project
            ? $this->canViewProjectResults($project, $context)
            : $this->authorizationChecker->isGranted(QuestionnaireVoter::EXPORT, $questionnaire);
    }

    public function canViewQuestionResults(?AbstractQuestion $question, ?\ArrayObject $context = null): bool
    {
        return $question && (!$question->getQuestionnaire()
            || 'QUESTIONNAIRE_ANALYSIS' === $question->getQuestionnaire()->getType()
            || $this->canViewResults($question->getQuestionnaire(), $context));
    }

    public function canViewReply(
        Reply $reply,
        ?User $viewer = null,
        ?\ArrayObject $context = null,
        ?Participant $participant = null,
        ?ResolveInfo $info = null
    ): bool {
        if (!$reply->getQuestionnaire()) {
            return false;
        }

        if ($info) {
            foreach ($context[self::AUTHORIZED_REPLIES] ?? [] as [$id, $path]) {
                if ($id === $reply->getId() && \array_slice($info->path, 0, \count($path)) === $path) {
                    return true;
                }
            }
        }

        $criteria = $this->getReplyCriteria($viewer, $context, $reply->getQuestionnaire(), $participant);
        if (null === $criteria) {
            return true;
        }

        foreach ($criteria as $field => $ids) {
            $id = match ($field) {
                'id' => $reply->getId(),
                'author' => $reply->getAuthor()?->getId(),
                'participant' => $reply->getParticipant()?->getId(),
                'questionnaire' => $reply->getQuestionnaire()->getId(),
            };
            if (\in_array($id, $ids, true)) {
                return true;
            }
        }

        return false;
    }

    public function canViewResponse(AbstractResponse $response, ?User $viewer = null, ?\ArrayObject $context = null, ?ResolveInfo $info = null): bool
    {
        if ($reply = $response->getReply()) {
            return $this->canViewReply($reply, $viewer, $context, null, $info);
        }
        if ($viewer?->isAdmin() || true === ($context['disable_acl'] ?? false)) {
            return true;
        }

        if ($analysis = $response->getAnalysis()) {
            return $viewer && $this->authorizationChecker->isGranted(ProposalAnalysisRelatedVoter::VIEW, $analysis->getProposal());
        }

        $proposal = $response->getProposal() ?? $response->getProposalEvaluation()?->getProposal();
        $author = $response->getProposal() ? $response->getProposal()->getAuthor() : ($response->getUser() ?? $response->getParticipant());
        if (!$proposal && !$author) {
            return false;
        }
        $identity = $viewer ?? $this->participantAuthentication->getParticipant();
        $isAuthor = $identity && $author === $identity && !$response->getProposalEvaluation();
        if (!$response->getQuestion()->getHidden()) {
            if ($isAuthor || (!$response->getQuestion()->isPrivate() && (!$proposal || $proposal->viewerCanSee($viewer)))) {
                return true;
            }
        }

        return $proposal && $viewer && ($this->authorizationChecker->isGranted(ProposalAnalysisRelatedVoter::VIEW, $proposal)
            || ($this->legacyAnalystAccess)($proposal, $viewer));
    }

    /** @param array{reply?: null|Reply} $payload */
    public function authorizeReply(array $payload, \ArrayObject $context, ResolveInfo $info): ?Reply
    {
        $reply = $payload['reply'] ?? null;
        if ($reply?->getId()) {
            $grants = $context[self::AUTHORIZED_REPLIES] ?? [];
            $grants[] = [$reply->getId(), $info->path];
            $context[self::AUTHORIZED_REPLIES] = $grants;
        }

        return $reply;
    }

    public function canViewProjectResults(Project $project, ?\ArrayObject $context = null): bool
    {
        return true === ($context['disable_acl'] ?? false)
            || $this->authorizationChecker->isGranted(ProjectVoter::VIEW, $project);
    }

    public function restrictReplyQuery(QueryBuilder $query, string $alias, ?User $viewer, ?\ArrayObject $context = null): void
    {
        $query->andWhere("{$alias}.questionnaire IS NOT NULL");
        $criteria = $this->getReplyCriteria($viewer, $context);
        if (null === $criteria) {
            return;
        }

        $allowed = $query->expr()->orX();
        foreach ($criteria as $field => $ids) {
            $allowed->add("{$alias}.{$field} IN (:readableReply_{$field})");
            $query->setParameter("readableReply_{$field}", $ids);
        }
        $query->andWhere($allowed);
    }

    public function restrictContributionQuery(BoolQuery $query, ?User $viewer, ?\ArrayObject $context = null): void
    {
        $context ??= new \ArrayObject();
        $criteria = $this->getReplyCriteria($viewer, $context);
        if (null === $criteria) {
            return;
        }

        $allowed = (new BoolQuery())
            ->addShould((new BoolQuery())->addMustNot(new Term(['objectType' => 'reply'])))
            ->setMinimumShouldMatch(1)
        ;
        foreach ($criteria as $field => $ids) {
            // Replies index the step and author, but not the questionnaire or participant.
            if ('questionnaire' === $field) {
                $field = 'step.id';
                $ids = array_values(array_filter($viewer ? $this->getManagedQuestionnaireStepIds($viewer, $context) : []));
            } elseif ('participant' === $field) {
                $field = 'id';
                $ids = $ids ? array_column($this->replyRepository->createQueryBuilder('r')
                    ->select('r.id')->where('r.participant IN (:participants)')
                    ->setParameter('participants', $ids)->getQuery()->getArrayResult(), 'id') : [];
            } elseif ('author' === $field) {
                $field = 'author.id';
            }
            $allowed->addShould(new Terms($field, $ids));
        }
        $query->addFilter($allowed);
    }

    /**
     * These alternatives define reply access for object reads, SQL and Elasticsearch.
     * Null grants all replies; empty ID lists grant nothing. A known questionnaire
     * avoids loading every managed questionnaire for an individual reply read.
     *
     * @return null|array<'author'|'id'|'participant'|'questionnaire', list<string>>
     */
    private function getReplyCriteria(
        ?User $viewer,
        ?\ArrayObject $context,
        ?Questionnaire $questionnaire = null,
        ?Participant $participant = null
    ): ?array {
        if (true === ($context['disable_acl'] ?? false) || $viewer?->isAdmin()) {
            return null;
        }

        $questionnaireIds = $questionnaire
            ? ($this->canViewResults($questionnaire, $context) ? [$questionnaire->getId()] : [])
            : ($viewer ? array_keys($this->getManagedQuestionnaireStepIds($viewer, $context)) : []);

        return [
            'id' => $this->getAuthorizedReplyIds($context, $viewer),
            'author' => $viewer?->getId() ? [$viewer->getId()] : [],
            'participant' => ($id = $viewer ? null : ($participant ?? $this->participantAuthentication->getParticipant())?->getId()) ? [$id] : [],
            'questionnaire' => $questionnaireIds,
        ];
    }

    /** @return array<string, null|string> */
    private function getManagedQuestionnaireStepIds(User $viewer, ?\ArrayObject $context): array
    {
        $key = 'managed_questionnaire_step_ids_' . $viewer->getId();
        if (isset($context[$key])) {
            return $context[$key];
        }
        $managed = $this->questionnaireRepository->getManagedQuestionnaireStepIds($viewer);
        $context?->offsetSet($key, $managed);

        return $managed;
    }

    /** @return list<string> */
    private function getAuthorizedReplyIds(?\ArrayObject $context, ?User $viewer): array
    {
        $ids = [];
        if ($viewer || $this->participantAuthentication->getParticipant()) {
            return $ids;
        }
        $cookie = $this->requestStack->getCurrentRequest()?->cookies->get('CapcoAnonReply');
        if (!$cookie) {
            return $ids;
        }

        try {
            foreach ($this->cookieDecoder->decode($cookie) as $replies) {
                foreach ($replies as $access) {
                    $reply = $this->replyRepository->find($access['replyId']);
                    if ($reply?->getId() && $this->participantAccessResolver->canViewReplyFromCookie($reply, $cookie)) {
                        $ids[] = $reply->getId();
                    }
                }
            }
        } catch (\Throwable) {
            // Malformed or expired cookies never grant access.
        }

        return array_values(array_unique($ids));
    }
}
