<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalAnalysis;
use Capco\AppBundle\Enum\ProposalStatementErrorCode;
use Capco\AppBundle\Enum\ProposalStatementState;
use Capco\AppBundle\Form\ProposalAnalysisType;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Repository\ProposalAnalysisRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Security\ProposalAnalysisRelatedVoter;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class AnalyseProposalAnalysisMutation implements MutationInterface
{
    use MutationTrait;
    use ResolverTrait;

    public function __construct(private readonly ProposalRepository $proposalRepository, private readonly AuthorizationCheckerInterface $authorizationChecker, private readonly ProposalAnalysisRepository $analysisRepository, private readonly LoggerInterface $logger, private readonly ResponsesFormatter $responsesFormatter, private readonly EntityManagerInterface $entityManager, private readonly FormFactoryInterface $formFactory, private readonly Publisher $publisher)
    {
    }

    public function __invoke(Argument $args, $viewer)
    {
        $this->formatInput($args);
        $this->preventNullableViewer($viewer);

        [$proposalId, $decision, $responses] = [
            $args->offsetGet('proposalId'),
            $args->offsetGet('decision'),
            $args->offsetGet('responses'),
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
                'errorCode' => ProposalStatementErrorCode::NOT_ASSIGNED_PROPOSAL,
            ];
        }

        if (
            ($proposalDecision = $proposal->getDecision())
            && ProposalStatementState::DONE === $proposalDecision->getState()
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
            $proposalAnalysis = new ProposalAnalysis();
            $proposal->addAnalysis($proposalAnalysis);
        }

        $oldState = $proposalAnalysis->getState();

        $proposalAnalysis
            ->setUpdatedBy($viewer)
            ->setProposal($proposal)
            ->setState($decision)
        ;

        // Handle responses
        $responses = $this->responsesFormatter->format($responses);
        $form = $this->formFactory->create(ProposalAnalysisType::class, $proposalAnalysis, [
            'is_draft' => false,
        ]);
        $form->submit(compact('responses'), false);

        if (!$form->isValid() && $this->handleErrors($form)) {
            return [
                'analysis' => null,
                'errorCode' => ProposalStatementErrorCode::INVALID_FORM,
            ];
        }

        try {
            $this->entityManager->persist($proposalAnalysis);
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

        $this->notifyIfDecision($oldState, $proposalAnalysis);

        return ['analysis' => $proposalAnalysis, 'errorCode' => null];
    }

    private function handleErrors(FormInterface $form): bool
    {
        $errors = [];
        foreach ($form->getErrors() as $error) {
            $this->logger->error(__METHOD__ . ' : ' . (string) $error->getMessage());
            $this->logger->error(implode('', $form->getExtraData()));
            $errors[] = (string) $error->getMessage();
        }

        if (!empty($errors)) {
            return true;
        }

        return false;
    }

    private function notifyIfDecision(string $oldState, ProposalAnalysis $proposalAnalysis): void
    {
        $updateDate = $proposalAnalysis->getUpdatedAt();
        if (null === $updateDate) {
            $updateDate = new \DateTime();
        }

        $message = [
            'type' => 'analysis',
            'analysisId' => $proposalAnalysis->getId(),
            'proposalId' => $proposalAnalysis->getProposal()->getId(),
            'date' => $updateDate->format('Y-m-d H:i:s'),
        ];
        if (
            $proposalAnalysis->getState() !== $oldState
            && \in_array($proposalAnalysis->getState(), ProposalStatementState::getDecisionalTypes())
        ) {
            $this->publisher->publish(
                CapcoAppBundleMessagesTypes::PROPOSAL_ANALYSE,
                new Message(json_encode($message))
            );
        }
    }
}
