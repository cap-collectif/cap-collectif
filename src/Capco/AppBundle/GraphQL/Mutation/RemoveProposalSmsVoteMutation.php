<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerHasVoteDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerVoteDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalVotesDataLoader;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\PhoneTokenRepository;
use Capco\AppBundle\Repository\ProposalCollectSmsVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionSmsVoteRepository;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class RemoveProposalSmsVoteMutation implements MutationInterface
{
    use MutationTrait;

    final public const PHONE_NOT_FOUND = 'PHONE_NOT_FOUND';

    private readonly EntityManagerInterface $em;
    private readonly ProposalVotesDataLoader $proposalVotesDataLoader;
    private readonly ProposalCollectSmsVoteRepository $proposalCollectSmsVoteRepository;
    private readonly ProposalSelectionSmsVoteRepository $proposalSelectionSmsVoteRepository;
    private readonly ProposalViewerVoteDataLoader $proposalViewerVoteDataLoader;
    private readonly ProposalViewerHasVoteDataLoader $proposalViewerHasVoteDataLoader;
    private readonly GlobalIdResolver $globalIdResolver;
    private readonly Indexer $indexer;
    private readonly PhoneTokenRepository $phoneTokenRepository;
    private readonly ProposalVoteAccountHandler $proposalVoteAccountHandler;

    public function __construct(
        EntityManagerInterface $em,
        ProposalVotesDataLoader $proposalVotesDataLoader,
        ProposalCollectSmsVoteRepository $proposalCollectSmsVoteRepository,
        ProposalSelectionSmsVoteRepository $proposalSelectionSmsVoteRepository,
        ProposalViewerVoteDataLoader $proposalViewerVoteDataLoader,
        ProposalViewerHasVoteDataLoader $proposalViewerHasVoteDataLoader,
        Indexer $indexer,
        GlobalIdResolver $globalIdResolver,
        PhoneTokenRepository $phoneTokenRepository,
        ProposalVoteAccountHandler $proposalVoteAccountHandler
    ) {
        $this->em = $em;
        $this->proposalVotesDataLoader = $proposalVotesDataLoader;
        $this->proposalCollectSmsVoteRepository = $proposalCollectSmsVoteRepository;
        $this->proposalSelectionSmsVoteRepository = $proposalSelectionSmsVoteRepository;
        $this->proposalViewerVoteDataLoader = $proposalViewerVoteDataLoader;
        $this->proposalViewerHasVoteDataLoader = $proposalViewerHasVoteDataLoader;
        $this->indexer = $indexer;
        $this->globalIdResolver = $globalIdResolver;
        $this->phoneTokenRepository = $phoneTokenRepository;
        $this->proposalVoteAccountHandler = $proposalVoteAccountHandler;
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $proposalId = $input->offsetGet('proposalId');
        $stepId = $input->offsetGet('stepId');
        $token = $input->offsetGet('token');

        $proposal = $this->globalIdResolver->resolve($proposalId, null);
        $step = $this->globalIdResolver->resolve($stepId, null);
        $phoneToken = $this->phoneTokenRepository->findOneBy(['token' => $token]);
        if (!$phoneToken) {
            return ['errorCode' => self::PHONE_NOT_FOUND];
        }
        $phone = $phoneToken->getPhone();

        if (!$proposal) {
            throw new UserError('Unknown proposal with id: ' . $proposalId);
        }
        if (!$step) {
            throw new UserError('Unknown step with id: ' . $stepId);
        }

        if ($step instanceof CollectStep) {
            $currentVote = $this->proposalCollectSmsVoteRepository->findOneBy([
                'phone' => $phone,
                'proposal' => $proposal,
                'collectStep' => $step,
            ]);
        } elseif ($step instanceof SelectionStep) {
            $currentVote = $this->proposalSelectionSmsVoteRepository->findOneBy([
                'phone' => $phone,
                'proposal' => $proposal,
                'selectionStep' => $step,
            ]);
        } else {
            throw new UserError('Wrong step with id: ' . $stepId);
        }

        if (!$currentVote) {
            throw new UserError('You have not voted for this proposal in this step.');
        }

        if (!$step->isOpen()) {
            throw new UserError('This step is no longer contributable.');
        }

        if ($step instanceof SelectionStep) {
            $this->proposalVoteAccountHandler->checkIfAnonVotesAreStillAccounted($step, $currentVote, $phone, false);
        }
        $previousVoteId = $currentVote->getId();
        $this->indexer->remove(ClassUtils::getClass($currentVote), $previousVoteId);
        $this->em->remove($currentVote);
        $this->em->flush();
        $this->indexer->index(
            ClassUtils::getClass($currentVote->getProposal()),
            $currentVote->getProposal()->getId()
        );
        $this->indexer->finishBulk();

        $this->proposalVotesDataLoader->invalidate($proposal);
        $this->proposalViewerVoteDataLoader->invalidate($proposal);
        $this->proposalViewerHasVoteDataLoader->invalidate($proposal);

        // Synchronously index for mutation payload
        $this->proposalVotesDataLoader->useElasticsearch = false;

        return [
            'proposal' => $proposal,
            'previousVoteId' => $previousVoteId,
            'step' => $step,
        ];
    }
}
