<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Security\DebateOpinionVoter;
use Psr\Log\LoggerInterface;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Form\DebateOpinionType;
use Capco\AppBundle\Entity\Debate\DebateOpinion;
use Symfony\Component\Form\FormFactoryInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class AddDebateOpinionMutation implements MutationInterface
{
    public const UNKNOWN_DEBATE = 'UNKNOWN_DEBATE';
    public const INVALID_FORM = 'INVALID_FORM';
    private EntityManagerInterface $em;
    private FormFactoryInterface $formFactory;
    private LoggerInterface $logger;
    private GlobalIdResolver $globalIdResolver;
    private AuthorizationCheckerInterface $authorizationChecker;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        GlobalIdResolver $globalIdResolver,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->em = $em;
        $this->logger = $logger;
        $this->formFactory = $formFactory;
        $this->globalIdResolver = $globalIdResolver;
        $this->authorizationChecker = $authorizationChecker;
    }

    public function __invoke(Arg $input): array
    {
        $debateId = $input->offsetGet('debateId');
        $debate = $this->globalIdResolver->resolve($debateId, null);

        if (!$debate || !$debate instanceof Debate) {
            $this->logger->error('Unknown argument `debateId`.', ['id' => $debateId]);

            return $this->generateErrorPayload(self::UNKNOWN_DEBATE);
        }

        $debateOpinion = (new DebateOpinion())->setDebate($debate);

        $values = $input->getArrayCopy();
        unset($values['debateId']);
        $form = $this->formFactory->create(DebateOpinionType::class, $debateOpinion);
        $form->submit($values, false);

        if (!$form->isValid()) {
            $this->logger->error('Invalid `DebateOpinionType` form data.', [
                'errors' => GraphQLException::getPlainErrors($form),
            ]);

            return $this->generateErrorPayload(self::INVALID_FORM);
        }

        $this->em->persist($debateOpinion);
        $this->em->flush();

        return ['debateOpinion' => $debateOpinion, 'errorCode' => null];
    }

    public function isGranted(): bool
    {
        return $this->authorizationChecker->isGranted(
            DebateOpinionVoter::CREATE,
            new DebateOpinion()
        );
    }

    private function generateErrorPayload(string $message): array
    {
        return ['debateOpinion' => null, 'errorCode' => $message];
    }
}
