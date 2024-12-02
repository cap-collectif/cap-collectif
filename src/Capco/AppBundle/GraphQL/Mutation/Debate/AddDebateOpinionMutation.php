<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateOpinion;
use Capco\AppBundle\Form\DebateOpinionType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Security\DebateOpinionVoter;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class AddDebateOpinionMutation implements MutationInterface
{
    use MutationTrait;

    final public const UNKNOWN_DEBATE = 'UNKNOWN_DEBATE';
    final public const INVALID_FORM = 'INVALID_FORM';

    public function __construct(private readonly EntityManagerInterface $em, private readonly FormFactoryInterface $formFactory, private readonly LoggerInterface $logger, private readonly GlobalIdResolver $globalIdResolver, private readonly AuthorizationCheckerInterface $authorizationChecker)
    {
    }

    public function __invoke(Arg $input): array
    {
        $this->formatInput($input);
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
