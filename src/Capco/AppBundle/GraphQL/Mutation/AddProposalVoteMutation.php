<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Symfony\Component\HttpFoundation\RequestStack;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalVotesDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\User\ViewerProposalVotesDataLoader;
use Capco\AppBundle\GraphQL\Resolver\Requirement\StepRequirementsResolver;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerVoteDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerHasVoteDataLoader;

class AddProposalVoteMutation implements MutationInterface
{
    private $em;
    private $validator;
    private $logger;
    private $resolver;
    private $proposalVotesDataLoader;
    private $proposalCollectVote;
    private $proposalSelectionVoteRepository;
    private $proposalViewerVoteDataLoader;
    private $proposalViewerHasVoteDataLoader;
    private $viewerProposalVotesDataLoader;
    private $globalIdResolver;

    public function __construct(
        EntityManagerInterface $em,
        ValidatorInterface $validator,
        LoggerInterface $logger,
        StepRequirementsResolver $resolver,
        ProposalVotesDataLoader $proposalVotesDataLoader,
        ProposalCollectVoteRepository $proposalCollectVote,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        ProposalViewerVoteDataLoader $proposalViewerVoteDataLoader,
        ProposalViewerHasVoteDataLoader $proposalViewerHasVoteDataLoader,
        ViewerProposalVotesDataLoader $viewerProposalVotesDataLoader,
        GlobalIdResolver $globalIdResolver
    ) {
        $this->em = $em;
        $this->validator = $validator;
        $this->logger = $logger;
        $this->resolver = $resolver;
        $this->proposalVotesDataLoader = $proposalVotesDataLoader;
        $this->proposalCollectVote = $proposalCollectVote;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->proposalViewerVoteDataLoader = $proposalViewerVoteDataLoader;
        $this->proposalViewerHasVoteDataLoader = $proposalViewerHasVoteDataLoader;
        $this->viewerProposalVotesDataLoader = $viewerProposalVotesDataLoader;
        $this->globalIdResolver = $globalIdResolver;
    }

    public function __invoke(Argument $input, User $user, RequestStack $request): array
    {
        $proposalId = $input->offsetGet('proposalId');
        $stepId = $input->offsetGet('stepId');
        $proposal = $this->globalIdResolver->resolve($proposalId, $user);
        $step = $this->globalIdResolver->resolve($stepId, $user);

        if (!$proposal) {
            throw new UserError('Unknown proposal with id: ' . $proposalId);
        }
        if (!$step) {
            throw new UserError('Unknown step with id: ' . $stepId);
        }

        /** @var AbstractStep $step */
        if (!$this->resolver->viewerMeetsTheRequirementsResolver($user, $step)) {
            throw new UserError('You dont meets all the requirements.');
        }

        if ($step instanceof CollectStep) {
            // Check if proposal is in step
            if ($step !== $proposal->getProposalForm()->getStep()) {
                throw new UserError('This proposal is not associated to this collect step.');
            }

            $countUserVotes = $this->proposalCollectVote->countVotesByStepAndUser($step, $user);
            $vote = (new ProposalCollectVote())->setCollectStep($step);
        } elseif ($step instanceof SelectionStep) {
            if (!\in_array($step, $proposal->getSelectionSteps(), true)) {
                throw new UserError('This proposal is not associated to this selection step.');
            }
            $countUserVotes = $this->proposalSelectionVoteRepository->countVotesByStepAndUser(
                $step,
                $user
            );
            $vote = (new ProposalSelectionVote())->setSelectionStep($step);
        } else {
            throw new UserError('Wrong step with id: ' . $stepId);
        }

        // Check if step is contributable
        if (!$step->canContribute($user)) {
            throw new UserError('This step is no longer contributable.');
        }

        // Check if step is votable
        if (!$step->isVotable()) {
            throw new UserError('This step is not votable.');
        }

        // Check if user has reached limit of votes
        if ($step->isNumberOfVotesLimitted() && $countUserVotes >= $step->getVotesLimit()) {
            throw new UserError('You have reached the limit of votes.');
        }

        $vote
            ->setIpAddress($request->getCurrentRequest()->getClientIp())
            ->setUser($user)
            ->setPrivate($input->offsetGet('anonymously'))
            ->setProposal($proposal);
        $errors = $this->validator->validate($vote);
        foreach ($errors as $error) {
            $this->logger->error((string) $error->getMessage());

            throw new UserError((string) $error->getMessage());
        }

        $this->em->persist($vote);

        try {
            $this->em->flush();
            $this->proposalVotesDataLoader->invalidate($proposal);
            $this->proposalViewerVoteDataLoader->invalidate($proposal);
            $this->proposalViewerHasVoteDataLoader->invalidate($proposal);
            $this->viewerProposalVotesDataLoader->invalidate($user);
        } catch (UniqueConstraintViolationException $e) {
            throw new UserError('proposal.vote.already_voted');
        }

        // Synchronously index for mutation payload
        $this->proposalVotesDataLoader->useElasticsearch = false;
        $edge = new Edge(ConnectionBuilder::offsetToCursor(0), $vote);

        return ['vote' => $vote, 'viewer' => $user, 'voteEdge' => $edge, 'proposal' => $proposal];
    }
}
