<?php
namespace Capco\AppBundle\GraphQL\Mutation;

use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVote;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Entity\OpinionVersion;
use Overblog\GraphQLBundle\Error\UserError;
use Doctrine\DBAL\Exception\DriverException;
use Capco\AppBundle\Entity\OpinionVersionVote;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Repository\OpinionRepository;
use Symfony\Component\HttpFoundation\RequestStack;
use Capco\AppBundle\Repository\OpinionVoteRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\AppBundle\Repository\OpinionVersionVoteRepository;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class AddOpinionVoteMutation implements MutationInterface
{
    private $em;
    private $validator;
    private $opinionRepo;
    private $opinionVoteRepo;
    private $versionRepo;
    private $versionVoteRepo;
    private $logger;

    public function __construct(
        EntityManagerInterface $em,
        ValidatorInterface $validator,
        OpinionRepository $opinionRepo,
        OpinionVoteRepository $opinionVoteRepo,
        OpinionVersionRepository $versionRepo,
        OpinionVersionVoteRepository $versionVoteRepo,
        LoggerInterface $logger
    ) {
        $this->em = $em;
        $this->validator = $validator;
        $this->opinionRepo = $opinionRepo;
        $this->opinionVoteRepo = $opinionVoteRepo;
        $this->versionRepo = $versionRepo;
        $this->versionVoteRepo = $versionVoteRepo;
        $this->logger = $logger;
    }

    public function __invoke(Argument $input, User $viewer, RequestStack $requestStack): array
    {
        $opinion = $this->opinionRepo->find($input->offsetGet('opinionId'));
        $version = $this->versionRepo->find($input->offsetGet('opinionId'));

        if (!$opinion || !$version) {
            throw new UserError(
                'Unknown opinion/version with id: ' . $input->offsetGet('opinionId')
            );
        }

        $contribution = $opinion ?? $version;
        $step = $contribution->getStep();

        // Check if step is contributable
        if (!$step->canContribute()) {
            throw new UserError('This step is no longer contributable.');
        }

        // Check if step is votable
        if (!$step->isVotable()) {
            throw new UserError('This step is not votable.');
        }

        if (!$opinion->canContribute()) {
            throw new UserError('Uncontribuable opinion.');
        }

        $voteValue = $input->offsetGet('value');
        $previousVote = null;

        if ($contribution instanceof Opinion) {
            $previousVote = $this->opinionVoteRepo->findOneBy([
                'user' => $viewer,
                'opinion' => $opinion,
            ]);
        }
        if ($contribution instanceof OpinionVersion) {
            $previousVote = $this->versionVoteRepo->findOneBy([
                'user' => $viewer,
                'opinion' => $opinion,
            ]);
        }

        if ($previousVote) {
            //$opinion->incrementVotesCountByType($vote->getValue());
            //$opinion->decrementVotesCountByType($previousVote->getValue());
            $previousVote->setValue($voteValue);
            $this->em->flush();

            return ['vote' => $previousVote, 'viewer' => $viewer];
        }

        $vote = null;
        if ($contribution instanceof Opinion) {
            $vote = (new OpinionVote())->setOpinion($contribution);
        }
        if ($contribution instanceof OpinionVersion) {
            $vote = (new OpinionVersionVote())->setOpinionVersion($contribution);
        }

        $vote
            ->setIpAddress($requestStack->getCurrentRequest()->getClientIp())
            ->setUser($viewer)
            ->setValue($voteValue);
        // $opinion->incrementVotesCountByType($vote->getValue());

        try {
            $this->em->persist($vote);
            $this->em->flush();
        } catch (DriverException $e) {
            // Updating opinion votes count failed
            throw new UserError('Sorry, please retry.');
        }

        return ['vote' => $vote, 'viewer' => $viewer];
    }
}
