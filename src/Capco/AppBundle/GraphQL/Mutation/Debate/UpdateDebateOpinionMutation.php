<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Psr\Log\LoggerInterface;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Form\DebateOpinionType;
use Capco\AppBundle\Entity\Debate\DebateOpinion;
use Symfony\Component\Form\FormFactoryInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UpdateDebateOpinionMutation implements MutationInterface
{
    public const UNKNOWN_DEBATE_OPINION = 'UNKNOWN_DEBATE_OPINION';
    public const INVALID_FORM = 'INVALID_FORM';

    private EntityManagerInterface $em;
    private FormFactoryInterface $formFactory;
    private LoggerInterface $logger;
    private GlobalIdResolver $globalIdResolver;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        GlobalIdResolver $globalIdResolver
    ) {
        $this->em = $em;
        $this->logger = $logger;
        $this->formFactory = $formFactory;
        $this->globalIdResolver = $globalIdResolver;
    }

    public function __invoke(Arg $input): array
    {
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

    private function generateSuccessFulPayload(DebateOpinion $debateOpinion): array
    {
        return ['debateOpinion' => $debateOpinion, 'errorCode' => null];
    }

    private function generateErrorPayload(string $errorCode): array
    {
        return ['debateOpinion' => null, 'errorCode' => $errorCode];
    }
}
