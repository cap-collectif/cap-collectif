<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Repository\PhoneTokenRepository;
use Capco\AppBundle\Repository\ProposalSelectionSmsVoteRepository;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Elasticsearch\Indexer;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Repository\ProposalCollectSmsVoteRepository;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalVotesDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerVoteDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerHasVoteDataLoader;
use Doctrine\Common\Util\ClassUtils;

class RemoveProposalSmsVoteMutation implements MutationInterface
{
    public const PHONE_NOT_FOUND = 'PHONE_NOT_FOUND';

    private EntityManagerInterface $em;
    private ProposalVotesDataLoader $proposalVotesDataLoader;
    private ProposalCollectSmsVoteRepository $proposalCollectSmsVoteRepository;
    private ProposalSelectionSmsVoteRepository $proposalSelectionSmsVoteRepository;
    private ProposalViewerVoteDataLoader $proposalViewerVoteDataLoader;
    private ProposalViewerHasVoteDataLoader $proposalViewerHasVoteDataLoader;
    private GlobalIdResolver $globalIdResolver;
    private Indexer $indexer;
    private PhoneTokenRepository $phoneTokenRepository;

    public function __construct(
        EntityManagerInterface $em,
        ProposalVotesDataLoader $proposalVotesDataLoader,
        ProposalCollectSmsVoteRepository $proposalCollectSmsVoteRepository,
        ProposalSelectionSmsVoteRepository $proposalSelectionSmsVoteRepository,
        ProposalViewerVoteDataLoader $proposalViewerVoteDataLoader,
        ProposalViewerHasVoteDataLoader $proposalViewerHasVoteDataLoader,
        Indexer $indexer,
        GlobalIdResolver $globalIdResolver,
        PhoneTokenRepository $phoneTokenRepository
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
    }

    public function __invoke(Argument $input): array
    {
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
