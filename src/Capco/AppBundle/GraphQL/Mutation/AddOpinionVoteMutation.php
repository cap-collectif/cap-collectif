<?php
namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\OpinionVote;
use Capco\AppBundle\Entity\OpinionVersionVote;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AddOpinionVoteMutation implements MutationInterface
{
    private $em;
    private $validator;
    private $proposalRepo;
    private $stepRepo;
    private $logger;
    private $resolver;

    public function __construct(
        EntityManagerInterface $em,
        ValidatorInterface $validator,
        ProposalRepository $proposalRepo,
        AbstractStepRepository $stepRepo,
        LoggerInterface $logger,
        StepRequirementsResolver $resolver
    ) {
        $this->em = $em;
        $this->validator = $validator;
        $this->opinionRepo = $opinionRepo;
        $this->versionRepo = $versionRepo;
        $this->logger = $logger;
        $this->resolver = $resolver;
    }

    public function __invoke(Argument $input, User $user, RequestStack $request)
    {
        $opinion = $this->opinionRepo->find($input->offsetGet('opinionId'));
        $version = $this->versionRepo->find($input->offsetGet('opinionId'));

        if (!$opinion || !$version) {
            throw new UserError(
                'Unknown opinion/version with id: ' . $input->offsetGet('opinionId')
            );
        }

        $step = $opinion->getStep();

        // Check if step is contributable
        if (!$step->canContribute()) {
            throw new UserError('This step is no longer contributable.');
        }

        // Check if step is votable
        if (!$step->isVotable()) {
            throw new UserError('This step is not votable.');
        }

        if (!$opinion->canContribute()) {
            throw new BadRequestHttpException('Uncontribuable opinion.');
        }

        // if ($validationErrors->count() > 0) {
        //     throw new BadRequestHttpException($validationErrors->__toString());
        // }

        // $user = $this->getUser();
        // $previousVote = $this->getDoctrine()
        //     ->getRepository('CapcoAppBundle:OpinionVote')
        //     ->findOneBy(['user' => $user, 'opinion' => $opinion]);

        // if ($previousVote) {
        //     $opinion->incrementVotesCountByType($vote->getValue());
        //     $opinion->decrementVotesCountByType($previousVote->getValue());

        //     $previousVote->setValue($vote->getValue());
        //     $this->getDoctrine()
        //         ->getManager()
        //         ->flush();

        //     return $previousVote;
        // }

        // $vote->setOpinion($opinion)->setUser($user);
        // $opinion->incrementVotesCountByType($vote->getValue());

        // try {
        //     $this->getDoctrine()
        //         ->getManager()
        //         ->persist($vote);
        //     $this->getDoctrine()
        //         ->getManager()
        //         ->flush();
        // } catch (DriverException $e) {
        //     // Updating opinion votes count failed
        //     throw new BadRequestHttpException('Sorry, please retry.');
        // }

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
        } catch (\Exception $e) {
            // Let's assume it's a Unique Exception
            throw new UserError('proposal.vote.already_voted');
        }

        return ['vote' => $vote, 'viewer' => $user];
    }
}
