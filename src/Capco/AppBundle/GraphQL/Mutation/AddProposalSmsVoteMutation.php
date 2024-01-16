<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\ProposalCollectSmsVote;
use Capco\AppBundle\Entity\ProposalSelectionSmsVote;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerHasVoteDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerVoteDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalVotesDataLoader;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\PhoneTokenRepository;
use Capco\AppBundle\Repository\ProposalCollectSmsVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionSmsVoteRepository;
use Capco\AppBundle\Utils\RequestGuesser;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AddProposalSmsVoteMutation implements MutationInterface
{
    use MutationTrait;

    public const PROPOSAL_ALREADY_VOTED = 'PROPOSAL_ALREADY_VOTED';
    public const VOTE_LIMIT_REACHED = 'VOTE_LIMIT_REACHED';
    public const PHONE_NOT_FOUND = 'PHONE_NOT_FOUND';

    private EntityManagerInterface $em;
    private ProposalVotesDataLoader $proposalVotesDataLoader;
    private ProposalCollectSmsVoteRepository $proposalCollectSmsVoteRepository;
    private ProposalSelectionSmsVoteRepository $proposalSelectionSmsVoteRepository;
    private ProposalViewerVoteDataLoader $proposalViewerVoteDataLoader;
    private ProposalViewerHasVoteDataLoader $proposalViewerHasVoteDataLoader;
    private GlobalIdResolver $globalIdResolver;
    private LoggerInterface $logger;
    private ValidatorInterface $validator;
    private RequestGuesser $requestGuesser;
    private PhoneTokenRepository $phoneTokenRepository;

    public function __construct(
        EntityManagerInterface $em,
        ValidatorInterface $validator,
        LoggerInterface $logger,
        ProposalVotesDataLoader $proposalVotesDataLoader,
        ProposalViewerVoteDataLoader $proposalViewerVoteDataLoader,
        ProposalViewerHasVoteDataLoader $proposalViewerHasVoteDataLoader,
        GlobalIdResolver $globalIdResolver,
        ProposalCollectSmsVoteRepository $proposalCollectSmsVoteRepository,
        ProposalSelectionSmsVoteRepository $proposalSelectionSmsVoteRepository,
        RequestGuesser $requestGuesser,
        PhoneTokenRepository $phoneTokenRepository
    ) {
        $this->em = $em;
        $this->validator = $validator;
        $this->logger = $logger;
        $this->proposalVotesDataLoader = $proposalVotesDataLoader;
        $this->proposalViewerVoteDataLoader = $proposalViewerVoteDataLoader;
        $this->proposalViewerHasVoteDataLoader = $proposalViewerHasVoteDataLoader;
        $this->globalIdResolver = $globalIdResolver;
        $this->proposalCollectSmsVoteRepository = $proposalCollectSmsVoteRepository;
        $this->proposalSelectionSmsVoteRepository = $proposalSelectionSmsVoteRepository;
        $this->requestGuesser = $requestGuesser;
        $this->phoneTokenRepository = $phoneTokenRepository;
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $proposalId = $input->offsetGet('proposalId');
        $stepId = $input->offsetGet('stepId');

        $token = $input->offsetGet('token');
        $phoneToken = $this->phoneTokenRepository->findOneBy(['token' => $token]);
        if (!$phoneToken) {
            return ['errorCode' => self::PHONE_NOT_FOUND];
        }
        $phone = $phoneToken->getPhone();

        $consentSmsCommunication = $input->offsetGet('consentSmsCommunication');

        $proposal = $this->globalIdResolver->resolve($proposalId, null);
        $step = $this->globalIdResolver->resolve($stepId, null);

        if (!$proposal) {
            throw new UserError('Unknown proposal with id: ' . $proposalId);
        }
        if (!$step) {
            throw new UserError('Unknown step with id: ' . $stepId);
        }

        if ($step instanceof CollectStep) {
            // Check if proposal is in step
            if ($step !== $proposal->getProposalForm()->getStep()) {
                throw new UserError('This proposal is not associated to this collect step.');
            }

            $countUserVotes = $this->proposalCollectSmsVoteRepository->countByTokenAndStep(
                $step,
                $token
            );
            $vote = (new ProposalCollectSmsVote())->setCollectStep($step);
        } elseif ($step instanceof SelectionStep) {
            if (!\in_array($step, $proposal->getSelectionSteps(), true)) {
                throw new UserError('This proposal is not associated to this selection step.');
            }
            $countUserVotes = $this->proposalSelectionSmsVoteRepository->countByTokenAndStep(
                $step,
                $token
            );
            $vote = (new ProposalSelectionSmsVote())->setSelectionStep($step);
        } else {
            throw new UserError('Wrong step with id: ' . $stepId);
        }

        // Check if step is contributable
        if (!$step->canContribute()) {
            throw new UserError('This step is no longer contributable.');
        }

        // Check if step is votable
        if (!$step->isVotable()) {
            throw new UserError('This step is not votable.');
        }

        // Check if user has reached limit of votes
        if ($step->isNumberOfVotesLimitted() && $countUserVotes >= $step->getVotesLimit()) {
            // when vote limit is reached we need to fetch user votes to refresh the relay cache
            $paginator = new Paginator(function () use ($step, $token) {
                $repository =
                    $step instanceof CollectStep
                        ? $this->proposalCollectSmsVoteRepository
                        : $this->proposalSelectionSmsVoteRepository;

                return $repository
                    ->getByTokenAndStep($step, $token)
                    ->getIterator()
                    ->getArrayCopy()
                ;
            });
            $connection = $paginator->auto(new Argument(), $countUserVotes);

            return ['errorCode' => self::VOTE_LIMIT_REACHED, 'votes' => $connection];
        }

        $vote
            ->setIpAddress($this->requestGuesser->getClientIp())
            ->setPhone($phone)
            ->setProposal($proposal)
            ->setConsentSmsCommunication($consentSmsCommunication)
        ;

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
        } catch (UniqueConstraintViolationException $e) {
            return ['errorCode' => self::PROPOSAL_ALREADY_VOTED];
        }

        // Synchronously index for mutation payload
        $this->proposalVotesDataLoader->useElasticsearch = false;
        $edge = new Edge(ConnectionBuilder::offsetToCursor(0), $vote);

        return ['vote' => $vote, 'voteEdge' => $edge, 'proposal' => $proposal];
    }
}
