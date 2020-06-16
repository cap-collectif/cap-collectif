<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalDecision;
use Capco\AppBundle\Enum\ProposalStatementErrorCode;
use Capco\AppBundle\Enum\ProposalStatementState;
use Capco\AppBundle\Event\DecisionEvent;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\StatusRepository;
use Capco\AppBundle\Security\ProposalAnalysisRelatedVoter;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Authorization\AuthorizationChecker;
use Symfony\Contracts\Translation\TranslatorInterface;

class ChangeProposalDecisionMutation implements MutationInterface
{
    use ResolverTrait;

    private $proposalRepository;
    private $entityManager;
    private $authorizationChecker;
    private $logger;
    private $proposalDecisionRepository;
    private $userRepository;
    private $translator;
    private $statusRepository;
    private $eventDispatcher;
    private $indexer;

    public function __construct(
        ProposalRepository $proposalRepository,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager,
        StatusRepository $statusRepository,
        AuthorizationChecker $authorizationChecker,
        LoggerInterface $logger,
        Indexer $indexer,
        TranslatorInterface $translator,
        EventDispatcherInterface $eventDispatcher
    ) {
        $this->proposalRepository = $proposalRepository;
        $this->entityManager = $entityManager;
        $this->authorizationChecker = $authorizationChecker;
        $this->logger = $logger;
        $this->indexer = $indexer;
        $this->userRepository = $userRepository;
        $this->translator = $translator;
        $this->statusRepository = $statusRepository;
        $this->eventDispatcher = $eventDispatcher;
    }

    public function __invoke(Argument $args, $viewer, RequestStack $request): array
    {
        $this->preventNullableViewer($viewer);
        $proposal = $this->getProposal($args);

        $errorCode = $this->getErrorCode($proposal, $args);
        if ($errorCode) {
            return [
                'decision' => null,
                'errorCode' => $errorCode,
            ];
        }

        $proposalDecision = $this->updateDecision(
            $proposal,
            $args,
            $viewer,
            $request->getCurrentRequest()->getLocale()
        );
        $post = $this->updateDecisionPost($proposalDecision->getPost(), $args);
        $this->setRefusedReasonIfAny($proposalDecision, $args);

        if ($args->offsetGet('isDone')) {
            self::setAnalysisAndStatementAsTooLate($proposal);
        }

        $analysisConfig = $proposal->getProposalForm()->getAnalysisConfiguration();
        if ($analysisConfig && $analysisConfig->isImmediatelyEffective()) {
            if ($args->offsetGet('isDone')) {
                $this->dispatchEvent($proposal, $args);
            }
            $this->entityManager->flush();
            $this->index($proposal, $post);

            return [
                'decision' => $proposalDecision,
                'proposal' => $proposal,
                'errorCode' => null,
            ];
        }
        $post->setIsPublished(false);

        try {
            $this->entityManager->flush();
        } catch (\Exception $exception) {
            $this->logger->alert(
                'An error occurred when editing Post and ProposalDecision with proposal id :' .
                    $proposal->getId() .
                    '.' .
                    $exception->getMessage()
            );

            return [
                'decision' => null,
                'errorCode' => ProposalStatementErrorCode::INTERNAL_ERROR,
            ];
        }
        $this->index($proposal);

        return [
            'decision' => $proposalDecision,
            'proposal' => $proposal,
            'errorCode' => null,
        ];
    }

    private function createProposalDecision(Proposal $proposal, string $locale): ProposalDecision
    {
        $post = new Post();
        $proposalDecision = new ProposalDecision($proposal, $post);

        $post
            ->setLocale($locale)
            ->setTitle(
                $this->translator->trans(
                    'proposal_decision.official_response',
                    [],
                    'CapcoAppBundle',
                    $locale
                )
            )
            ->addProposal($proposal)
            ->setIsPublished(false)
            ->setdisplayedOnBlog(false);

        $post->mergeNewTranslations();
        $proposalDecision->setProposal($proposal);
        $this->entityManager->persist($proposalDecision);

        return $proposalDecision;
    }

    private function getErrorCode(?Proposal $proposal, Argument $args): ?string
    {
        if (!$proposal) {
            return ProposalStatementErrorCode::NON_EXISTING_PROPOSAL;
        }
        if (
            !$this->authorizationChecker->isGranted(ProposalAnalysisRelatedVoter::DECIDE, $proposal)
        ) {
            return ProposalStatementErrorCode::NOT_ASSIGNED_PROPOSAL;
        }
        if (!$args->offsetGet('isApproved') && null === $args->offsetGet('refusedReason')) {
            return ProposalStatementErrorCode::REFUSED_REASON_EMPTY;
        }

        return null;
    }

    private function getProposal(Argument $args): ?Proposal
    {
        return $this->proposalRepository->find(
            GlobalId::fromGlobalId($args->offsetGet('proposalId'))['id']
        );
    }

    private function updateDecision(
        Proposal $proposal,
        Argument $args,
        User $viewer,
        ?string $locale
    ): ProposalDecision {
        // If there is no proposalDecision related to the given proposal, create it.
        if (!($proposalDecision = $proposal->getDecision())) {
            $proposalDecision = $this->createProposalDecision($proposal, $locale);
        }

        return $proposalDecision
            ->setIsApproved($args->offsetGet('isApproved') ?? false)
            ->setUpdatedBy($viewer)
            ->setEstimatedCost((int) $args->offsetGet('estimatedCost'))
            ->setState(
                $args->offsetGet('isDone') ?? false
                    ? ProposalStatementState::DONE
                    : ProposalStatementState::IN_PROGRESS
            );
    }

    private function updateDecisionPost(Post $post, Argument $args): Post
    {
        $post->setBody($args->offsetGet('body') ?? '');

        return $this->updateDecisionPostAuthors($post, $args);
    }

    private function updateDecisionPostAuthors(Post $post, Argument $args): Post
    {
        $authors = $args->offsetGet('authors') ?? [];
        if (!empty($authors)) {
            $authorsIds = [];
            foreach ($authors as $author) {
                $authorsIds[] = GlobalId::fromGlobalId($author)['id'];
            }
            $post->setAuthors($this->userRepository->findBy(['id' => $authorsIds]));
        }

        return $post;
    }

    private function setRefusedReasonIfAny(
        ProposalDecision $proposalDecision,
        Argument $args
    ): ProposalDecision {
        if ($args->offsetGet('refusedReason')) {
            $status = $this->statusRepository->find($args->offsetGet('refusedReason'));
            $proposalDecision->setRefusedReason($status);
        }

        return $proposalDecision;
    }

    private static function setAnalysisAndStatementAsTooLate(Proposal $proposal): Proposal
    {
        $proposalAssessment = $proposal->getAssessment();
        if (
            $proposalAssessment &&
            ProposalStatementState::IN_PROGRESS === $proposalAssessment->getState()
        ) {
            $proposalAssessment->setState(ProposalStatementState::TOO_LATE);
        }
        if (!empty($proposal->getAnalyses())) {
            foreach ($proposal->getAnalyses() as $analysis) {
                if (ProposalStatementState::IN_PROGRESS === $analysis->getState()) {
                    $analysis->setState(ProposalStatementState::TOO_LATE);
                }
            }
        }

        return $proposal;
    }

    private function index(Proposal $proposal, ?Post $post = null): void
    {
        $this->indexer->index(Proposal::class, $proposal->getId());
        if ($post) {
            $this->indexer->index(Post::class, $post->getId());
        }

        $this->indexer->finishBulk();
    }

    private function dispatchEvent(Proposal $proposal, Argument $args): DecisionEvent
    {
        $decision = $args->offsetGet('isApproved')
            ? CapcoAppBundleEvents::DECISION_APPROVED
            : CapcoAppBundleEvents::DECISION_REFUSED;
        $event = new DecisionEvent(
            $proposal,
            $proposal->getDecision(),
            $proposal->getProposalForm()->getAnalysisConfiguration()
        );
        $this->eventDispatcher->dispatch($decision, $event);

        return $event;
    }
}
