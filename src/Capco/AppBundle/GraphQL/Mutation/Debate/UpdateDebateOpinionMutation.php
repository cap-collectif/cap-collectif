<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Entity\Debate\DebateOpinion;
use Capco\AppBundle\Form\DebateOpinionType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Security\DebateOpinionVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class UpdateDebateOpinionMutation implements MutationInterface
{
    use MutationTrait;

    final public const UNKNOWN_DEBATE_OPINION = 'UNKNOWN_DEBATE_OPINION';
    final public const INVALID_FORM = 'INVALID_FORM';

    public function __construct(private readonly EntityManagerInterface $em, private readonly FormFactoryInterface $formFactory, private readonly LoggerInterface $logger, private readonly GlobalIdResolver $globalIdResolver, private readonly AuthorizationCheckerInterface $authorizationChecker)
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

        $values = $input->getArrayCopy();
        unset($values['debateOpinionId']);

        $form = $this->formFactory->create(DebateOpinionType::class, $debateOpinion);
        $form->submit($values, false);

        if (!$form->isValid()) {
            $this->logger->error('Invalid `DebateOpinionType` form data.', [
                'errors' => GraphQLException::getPlainErrors($form),
            ]);

            return $this->generateErrorPayload(self::INVALID_FORM);
        }

        $this->em->flush();

        return $this->generateSuccessFulPayload($debateOpinion);
    }

    public function isGranted(string $debateOpinionId, User $viewer): bool
    {
        $debateOpinion = $this->globalIdResolver->resolve($debateOpinionId, $viewer);
        if (!$debateOpinion) {
            return false;
        }

        return $this->authorizationChecker->isGranted(DebateOpinionVoter::EDIT, $debateOpinion);
    }

    private function generateSuccessFulPayload(DebateOpinion $debateOpinion): array
    {
        return ['debateOpinion' => $debateOpinion, 'errorCode' => null];
    }

    private function generateErrorPayload(string $errorCode): array
    {
        return ['debateOpinion' => null, 'errorCode' => $errorCode];
    }
}
