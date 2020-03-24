<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Enum\ProposalStatementErrorCode;
use Capco\AppBundle\Enum\ProposalStatementState;
use Capco\AppBundle\Form\ProposalAnalysisType;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Repository\ProposalAnalysisRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Security\ProposalAnalysisRelatedVoter;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserErrors;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationChecker;

class AnalyseProposalAnalysisMutation implements MutationInterface
{
    use ResolverTrait;

    private $proposalRepository;
    private $authorizationChecker;
    private $analysisRepository;
    private $logger;
    private $responsesFormatter;
    private $entityManager;
    private $formFactory;

    public function __construct(
        ProposalRepository $proposalRepository,
        AuthorizationChecker $authorizationChecker,
        ProposalAnalysisRepository $analysisRepository,
        LoggerInterface $logger,
        ResponsesFormatter $responsesFormatter,
        EntityManagerInterface $entityManager,
        FormFactoryInterface $formFactory
    ) {
        $this->proposalRepository = $proposalRepository;
        $this->authorizationChecker = $authorizationChecker;
        $this->analysisRepository = $analysisRepository;
        $this->logger = $logger;
        $this->responsesFormatter = $responsesFormatter;
        $this->entityManager = $entityManager;
        $this->formFactory = $formFactory;
    }

    public function __invoke(Argument $args, $viewer)
    {
        $this->preventNullableViewer($viewer);

        list($proposalId, $decision, $responses, $comment) = [
            $args->offsetGet('proposalId'),
            $args->offsetGet('decision'),
            $args->offsetGet('responses'),
            $args->offsetGet('comment'),
        ];

        $proposalId = GlobalId::fromGlobalId($proposalId)['id'];
        /** @var Proposal $proposal */
        $proposal = $this->proposalRepository->find($proposalId);
        if (!$proposal) {
            return [
                'analysis' => null,
                'errorCode' => ProposalStatementErrorCode::NON_EXISTING_PROPOSAL,
            ];
        }

        if (
            !$this->authorizationChecker->isGranted(
                ProposalAnalysisRelatedVoter::ANALYSE,
                $proposal
            )
        ) {
            return [
                'analysis' => null,
                'errorCode' => ProposalStatementErrorCode::UNASSIGNED_PROPOSAL,
            ];
        }

        if (
            ($proposalDecision = $proposal->getDecision()) &&
            ProposalStatementState::DONE === $proposalDecision->getState()
        ) {
            return [
                'analysis' => null,
                'errorCode' => ProposalStatementErrorCode::DECISION_ALREADY_GIVEN,
            ];
        }

        if (
            !($proposalAnalysis = $this->analysisRepository->findOneBy([
                'proposal' => $proposal,
                'updatedBy' => $viewer,
            ]))
        ) {
            return [
                'analysis' => null,
                'errorCode' => ProposalStatementErrorCode::NON_EXISTING_ANALYSIS,
            ];
        }

        $proposalAnalysis
            ->setUpdatedBy($viewer)
            ->setProposal($proposal)
            ->setComment($comment)
            ->setState($decision);

        // Handle responses
        if (!empty($responses)) {
            $responses = $this->responsesFormatter->format($responses);
            $form = $this->formFactory->create(ProposalAnalysisType::class, $proposalAnalysis);
            $form->submit(compact('responses'), false);

            if (!$form->isValid()) {
                $this->handleErrors($form);
            }
        }

        try {
            $this->entityManager->flush();
        } catch (\Exception $exception) {
            $this->logger->alert(
                'An error occurred when editing ProposalAnalysis with proposal id :' .
                    $proposalId .
                    '.' .
                    $exception->getMessage()
            );

            return [
                'analysis' => null,
                'errorCode' => ProposalStatementErrorCode::INTERNAL_ERROR,
            ];
        }

        return ['analysis' => $proposalAnalysis, 'errorCode' => null];
    }

    private function handleErrors(FormInterface $form): void
    {
        $errors = [];
        foreach ($form->getErrors() as $error) {
            $this->logger->error(__METHOD__ . ' : ' . (string) $error->getMessage());
            $this->logger->error(implode('', $form->getExtraData()));
            $errors[] = (string) $error->getMessage();
        }
        if (!empty($errors)) {
            throw new UserErrors($errors);
        }
    }
}
