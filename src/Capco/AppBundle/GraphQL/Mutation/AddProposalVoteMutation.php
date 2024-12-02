<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Exception\ContributorAlreadyUsedPhoneException;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerHasVoteDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerVoteDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalVotesDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\User\ViewerProposalVotesDataLoader;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Requirement\StepRequirementsResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Service\ContributionValidator;
use Capco\AppBundle\Utils\RequestGuesser;
use Capco\UserBundle\Entity\User;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Psr\Log\LoggerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AddProposalVoteMutation implements MutationInterface
{
    use MutationTrait;

    final public const PHONE_ALREADY_USED = 'PHONE_ALREADY_USED';

    public function __construct(private readonly EntityManagerInterface $em, private readonly ValidatorInterface $validator, private readonly LoggerInterface $logger, private readonly ProposalVoteAccountHandler $proposalVoteAccountHandler, private readonly StepRequirementsResolver $resolver, private readonly ProposalVotesDataLoader $proposalVotesDataLoader, private readonly ProposalCollectVoteRepository $proposalCollectVoteRepository, private readonly ProposalSelectionVoteRepository $proposalSelectionVoteRepository, private readonly ProposalViewerVoteDataLoader $proposalViewerVoteDataLoader, private readonly ProposalViewerHasVoteDataLoader $proposalViewerHasVoteDataLoader, private readonly ViewerProposalVotesDataLoader $viewerProposalVotesDataLoader, private readonly GlobalIdResolver $globalIdResolver, private readonly RequestGuesser $requestGuesser, private readonly ContributionValidator $contributionValidator)
    {
    }

    public function __invoke(Argument $input, User $user): array
    {
        $this->formatInput($input);
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

            $countUserVotes = $this->proposalCollectVoteRepository->countVotesByStepAndUser(
                $step,
                $user
            );
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

        if ($step instanceof SelectionStep && $user->getPhone()) {
            try {
                $this->contributionValidator->validatePhoneReusability($user->getPhone(), $vote, $step, null, $user);
            } catch (ContributorAlreadyUsedPhoneException) {
                return ['errorCode' => self::PHONE_ALREADY_USED];
            }
        }

        // Check if user has reached limit of votes
        if ($step->isNumberOfVotesLimitted() && $countUserVotes >= $step->getVotesLimit()) {
            throw new UserError('You have reached the limit of votes.');
        }

        $vote
            ->setIpAddress($this->requestGuesser->getClientIp())
            ->setUser($user)
            ->setPrivate($input->offsetGet('anonymously'))
            ->setProposal($proposal)
        ;
        $errors = $this->validator->validate($vote);
        foreach ($errors as $error) {
            $this->logger->error((string) $error->getMessage());

            throw new UserError((string) $error->getMessage());
        }

        $this->proposalVoteAccountHandler->checkIfUserVotesAreStillAccounted(
            $step,
            $vote,
            $user,
            true
        );
        $this->em->persist($vote);

        try {
            $this->em->flush();
            $this->proposalVotesDataLoader->invalidate($proposal);
            $this->proposalViewerVoteDataLoader->invalidate($proposal);
            $this->proposalViewerHasVoteDataLoader->invalidate($proposal);
            $this->viewerProposalVotesDataLoader->invalidate($user);
        } catch (UniqueConstraintViolationException) {
            throw new UserError('proposal.vote.already_voted');
        }

        // Synchronously index for mutation payload
        $this->proposalVotesDataLoader->useElasticsearch = false;
        $edge = new Edge(ConnectionBuilder::offsetToCursor(0), $vote);

        return ['vote' => $vote, 'viewer' => $user, 'voteEdge' => $edge, 'proposal' => $proposal];
    }
}
