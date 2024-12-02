<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Security\DebateOpinionVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class DeleteDebateOpinionMutation implements MutationInterface
{
    use MutationTrait;

    final public const UNKNOWN_DEBATE_OPINION = 'UNKNOWN_DEBATE_OPINION';

    public function __construct(private readonly EntityManagerInterface $em, private readonly LoggerInterface $logger, private readonly GlobalIdResolver $globalIdResolver, private readonly AuthorizationCheckerInterface $authorizationChecker)
    {
    }

    public function __invoke(Arg $input): array
    {
        $this->formatInput($input);
        $debateOpinionId = $input->offsetGet('debateOpinionId');
        $debateOpinion = $this->globalIdResolver->resolve($debateOpinionId, null);

        if (!$debateOpinion) {
            $this->logger->error('Unknown argument `debateOpinionId`.', ['id' => $debateOpinionId]);

            return $this->generateErrorPayload(self::UNKNOWN_DEBATE_OPINION);
        }

        $debate = $debateOpinion->getDebate();

        $this->em->remove($debateOpinion);
        $this->em->flush();

        return $this->generateSuccessFulPayload($debateOpinionId, $debate);
    }

    public function isGranted(string $debateOpinionId, User $viewer): bool
    {
        $debateOpinion = $this->globalIdResolver->resolve($debateOpinionId, $viewer);
        if (!$debateOpinion) {
            return false;
        }

        return $this->authorizationChecker->isGranted(DebateOpinionVoter::DELETE, $debateOpinion);
    }

    private function generateSuccessFulPayload(string $deletedId, Debate $debate): array
    {
        return ['debate' => $debate, 'deletedDebateOpinionId' => $deletedId, 'errorCode' => null];
    }

    private function generateErrorPayload(string $errorCode): array
    {
        return ['debate' => null, 'deletedDebateOpinionId' => null, 'errorCode' => $errorCode];
    }
}
