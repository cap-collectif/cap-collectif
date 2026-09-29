<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResponsesResolverTrait;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Capco\AppBundle\Security\ProposalAnalysisRelatedVoter;
use Capco\AppBundle\Service\ParticipantHelper;
use Capco\UserBundle\Entity\User;
use FOS\UserBundle\Util\TokenGenerator;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class ProposalResponsesResolver implements QueryInterface
{
    use ResponsesResolverTrait;
    private $analystRepository;
    private $analysisRelatedVoter;

    public function __construct(
        AbstractQuestionRepository $repository,
        AbstractResponseRepository $abstractResponseRepository,
        private ProposalViewerIsAnEvaluerResolver $proposalViewerIsAnEvaluerResolver,
        private readonly AuthorizationCheckerInterface $authorizationChecker,
        TokenGenerator $tokenGenerator,
        private readonly ParticipantHelper $participantHelper
    ) {
        $this->abstractQuestionRepository = $repository;
        $this->abstractResponseRepository = $abstractResponseRepository;
        $this->tokenGenerator = $tokenGenerator;
    }

    public function __invoke(Proposal $proposal, $viewer, \ArrayObject $context, ?string $participantToken = null): array
    {
        $isLegacyAnalyst = $this->proposalViewerIsAnEvaluerResolver->__invoke($proposal, $viewer);
        $isAnalyst = false;
        if ($viewer instanceof User) {
            $isAnalyst = $this->authorizationChecker->isGranted(
                ProposalAnalysisRelatedVoter::VIEW,
                $proposal
            );
        }

        if (null === $viewer && $participantToken) {
            try {
                $viewer = $this->participantHelper->getParticipantByToken($participantToken);
            } catch (ParticipantNotFoundException) {
            }
        }

        $responses = $this->filterVisibleResponses(
            $this->getResponsesForProposal($proposal),
            $proposal->getAuthor(),
            $viewer,
            $context,
            $isLegacyAnalyst,
            $isAnalyst
        );

        $iterator = $responses->getIterator();
        $responsesArray = iterator_to_array($iterator);

        usort($responsesArray, fn ($a, $b) => $a->getQuestion()->getPosition() - $b->getQuestion()->getPosition());

        return $responsesArray;
    }
}
