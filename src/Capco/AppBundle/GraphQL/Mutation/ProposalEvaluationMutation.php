<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\ProposalEvaluation;
use Capco\AppBundle\Form\ProposalEvaluationType;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Repository\ProposalEvaluationRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\DBAL\LockMode;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\OptimisticLockException;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\Form\FormFactoryInterface;

class ProposalEvaluationMutation implements MutationInterface
{
    private $entityManager;
    private $responsesFormatter;
    private $proposalEvaluationRepository;
    private $formFactory;
    private $proposalRepository;
    private $globalIdResolver;

    public function __construct(
        EntityManagerInterface $entityManager,
        ResponsesFormatter $responsesFormatter,
        ProposalEvaluationRepository $proposalEvaluationRepository,
        FormFactoryInterface $formFactory,
        ProposalRepository $proposalRepository,
        GlobalIdResolver $globalIdResolver
    ) {
        $this->entityManager = $entityManager;
        $this->responsesFormatter = $responsesFormatter;
        $this->proposalEvaluationRepository = $proposalEvaluationRepository;
        $this->formFactory = $formFactory;
        $this->proposalRepository = $proposalRepository;
        $this->globalIdResolver = $globalIdResolver;
    }

    public function __invoke(Argument $input, User $user): array
    {
        $arguments = $input->getArrayCopy();
        $version = $arguments['version'];

        $proposal = $this->globalIdResolver->resolve($arguments['proposalId'], $user);

        if (!$proposal) {
            throw new UserError(sprintf('Unknown proposal with id "%s"', $arguments['proposalId']));
        }

        $isEvaluer = $this->proposalRepository->isViewerAnEvaluer($proposal, $user);
        if (!$isEvaluer && !$user->isAdmin()) {
            throw new UserError(
                sprintf('You are not an evaluer of proposal with id %s', $arguments['proposalId'])
            );
        }
        unset($arguments['proposalId']);
        $proposalEvaluation = $this->proposalEvaluationRepository->findOneBy([
            'proposal' => $proposal
        ]);

        if (!$proposalEvaluation) {
            $proposalEvaluation = new ProposalEvaluation();
            $proposalEvaluation->setProposal($proposal);
        } else {
            try {
                $this->entityManager->lock($proposalEvaluation, LockMode::OPTIMISTIC, $version);
            } catch (OptimisticLockException $e) {
                throw new UserError('The proposal was modified. Please refresh the page.', 409);
            }
        }

        if (isset($arguments['responses'])) {
            $arguments['responses'] = $this->responsesFormatter->format($arguments['responses']);
        }

        $form = $this->formFactory->create(ProposalEvaluationType::class, $proposalEvaluation);

        unset($arguments['version']);
        $form->submit($arguments, false);

        if (!$form->isValid()) {
            throw new UserError('Form is not valid :' . (string) $form->getErrors(true, false));
        }

        $proposalEvaluation->setUpdatedAt(new \DateTime());
        $this->entityManager->persist($proposalEvaluation);

        try {
            $this->entityManager->flush();
        } catch (\Exception $e) {
            throw new UserError('Error during the flush :' . $e->getMessage());
        }

        return ['proposal' => $proposal];
    }
}
