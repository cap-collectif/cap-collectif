<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalAnalysis;
use Capco\AppBundle\Entity\ProposalDecision;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Enum\ProposalStatementErrorCode;
use Capco\AppBundle\Enum\ProposalStatementState;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\PostRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\StatusRepository;
use Capco\AppBundle\Security\ProposalAnalysisRelatedVoter;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationChecker;
use Symfony\Component\Translation\TranslatorInterface;

class ChangeProposalDecisionMutation implements MutationInterface
{
    use ResolverTrait;

    private $proposalRepository;
    private $entityManager;
    private $authorizationChecker;
    private $logger;
    private $proposalDecisionRepository;
    private $userRepository;
    private $postRepository;
    private $translator;
    private $statusRepository;

    public function __construct(
        ProposalRepository $proposalRepository,
        UserRepository $userRepository,
        PostRepository $postRepository,
        EntityManagerInterface $entityManager,
        StatusRepository $statusRepository,
        AuthorizationChecker $authorizationChecker,
        LoggerInterface $logger,
        TranslatorInterface $translator
    ) {
        $this->proposalRepository = $proposalRepository;
        $this->entityManager = $entityManager;
        $this->authorizationChecker = $authorizationChecker;
        $this->logger = $logger;
        $this->userRepository = $userRepository;
        $this->postRepository = $postRepository;
        $this->translator = $translator;
        $this->statusRepository = $statusRepository;
    }

    public function __invoke(Argument $args, $viewer): array
    {
        $this->preventNullableViewer($viewer);

        list($proposalId, $body, $estimatedCost, $authors, $decision, $refusedReason, $isDone) = [
            $args->offsetGet('proposalId'),
            $args->offsetGet('body'),
            $args->offsetGet('estimatedCost'),
            $args->offsetGet('authors') ?? [],
            $args->offsetGet('isApproved') ?? true,
            $args->offsetGet('refusedReason'),
            $args->offsetGet('isDone') ?? false,
        ];

        $proposalId = GlobalId::fromGlobalId($proposalId)['id'];
        $proposal = $this->proposalRepository->find($proposalId);

        if (!$proposal) {
            return [
                'decision' => null,
                'errorCode' => ProposalStatementErrorCode::NON_EXISTING_PROPOSAL,
            ];
        }

        /** @var Proposal $proposal */
        if (
            !$this->authorizationChecker->isGranted(ProposalAnalysisRelatedVoter::DECIDE, $proposal)
        ) {
            return [
                'decision' => null,
                'errorCode' => ProposalStatementErrorCode::NOT_ASSIGNED_PROPOSAL,
            ];
        }

        if (false === $decision && !$refusedReason) {
            return [
                'decision' => null,
                'errorCode' => ProposalStatementErrorCode::REFUSED_REASON_EMPTY,
            ];
        }

        // If there is no proposalDecision related to the given proposal, create it.
        if (!($proposalDecision = $proposal->getDecision())) {
            $proposalDecision = $this->createProposalDecision($proposal);
        }

        $proposalDecision
            ->setIsApproved($decision)
            ->setUpdatedBy($viewer)
            ->setEstimatedCost($estimatedCost)
            ->setState(
                $isDone ? ProposalStatementState::DONE : ProposalStatementState::IN_PROGRESS
            );
        $post = $proposalDecision->getPost();
        if (
            ($proposalAssessment = $proposal->getAssessment()) &&
            $proposalAssessment->getOfficialResponse()
        ) {
            $post->setBody($proposalAssessment->getOfficialResponse());
        } else {
            $post->setBody($body);
        }

        if (!empty($authors)) {
            $authorsIds = [];
            foreach ($authors as $author) {
                $authorsIds[] = GlobalId::fromGlobalId($author)['id'];
            }
            $post->setAuthors($this->userRepository->findBy(['id' => $authorsIds]));
        }

        if ($refusedReason) {
            /** @var Status $status */
            $status = $this->statusRepository->find($refusedReason);
            $proposalDecision->setRefusedReason($status);
        }

        // If the decision is given, change state of the assessment if its not already given.
        if ($isDone) {
            if (
                $proposalAssessment &&
                ProposalStatementState::IN_PROGRESS === $proposalAssessment->getState()
            ) {
                $proposalAssessment->setState(ProposalStatementState::TOO_LATE);
            }

            if (null !== $proposal->getAnalyses()) {
                /** @var ProposalAnalysis $analysis */
                foreach ($proposal->getAnalyses() as $analysis) {
                    if (ProposalStatementState::IN_PROGRESS === $analysis->getState()) {
                        $analysis->setState(ProposalStatementState::TOO_LATE);
                    }
                }
            }
        }

        try {
            $this->entityManager->flush();
        } catch (\Exception $exception) {
            $this->logger->alert(
                'An error occurred when editing Post and ProposalDecision with proposal id :' .
                    $proposalId .
                    '.' .
                    $exception->getMessage()
            );

            return [
                'decision' => null,
                'errorCode' => ProposalStatementErrorCode::INTERNAL_ERROR,
            ];
        }

        return [
            'decision' => $proposalDecision,
            'errorCode' => null,
        ];
    }

    private function createProposalDecision(Proposal $proposal): ProposalDecision
    {
        $post = new Post();
        $proposalDecision = new ProposalDecision($proposal, $post);

        $post
            ->setTitle(
                $this->translator->trans(
                    'proposal_decision.official_response',
                    [],
                    'CapcoAppBundle'
                )
            )
            ->addProject($proposal->getProject())
            ->addProposal($proposal)
            ->setIsPublished(false)
            ->setdisplayedOnBlog(false);

        $proposalDecision->setProposal($proposal);

        $this->entityManager->persist($post);
        $this->entityManager->persist($proposalDecision);

        return $proposalDecision;
    }
}
