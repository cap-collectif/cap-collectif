<?php
namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalVotesDataLoader;
use Capco\AppBundle\GraphQL\Resolver\Requirement\StepRequirementsResolver;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AddProposalVoteMutation implements MutationInterface
{
    private $em;
    private $validator;
    private $proposalRepo;
    private $stepRepo;
    private $logger;
    private $resolver;
    private $proposalVotesDataLoader;
    private $proposalCollectVote;
    private $proposalSelectionVoteRepository;

    public function __construct(
        EntityManagerInterface $em,
        ValidatorInterface $validator,
        ProposalRepository $proposalRepo,
        AbstractStepRepository $stepRepo,
        LoggerInterface $logger,
        StepRequirementsResolver $resolver,
        ProposalVotesDataLoader $proposalVotesDataLoader,
        ProposalCollectVoteRepository $proposalCollectVote,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository
    ) {
        $this->em = $em;
        $this->validator = $validator;
        $this->stepRepo = $stepRepo;
        $this->proposalRepo = $proposalRepo;
        $this->logger = $logger;
        $this->resolver = $resolver;
        $this->proposalVotesDataLoader = $proposalVotesDataLoader;
        $this->proposalCollectVote = $proposalCollectVote;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
    }

    public function __invoke(Argument $input, User $user, RequestStack $request): array
    {
        $proposal = $this->proposalRepo->find($input->offsetGet('proposalId'));
        $step = $this->stepRepo->find($input->offsetGet('stepId'));

        if (!$proposal) {
            throw new UserError('Unknown proposal with id: ' . $input->offsetGet('proposalId'));
        }
        if (!$step) {
            throw new UserError('Unknown step with id: ' . $input->offsetGet('stepId'));
        }

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
            throw new UserError('Wrong step with id: ' . $input->offsetGet('stepId'));
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
        } catch (\Exception $e) {
            // Let's assume it's a Unique Exception
            throw new UserError('proposal.vote.already_voted');
        }

        return ['vote' => $vote, 'viewer' => $user];
    }
}
