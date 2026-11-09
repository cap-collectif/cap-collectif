<?php

namespace Capco\AppBundle\GraphQL\Mutation\OpinionAdmin;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Enum\OpinionAdminErrorCode;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateOpinionAdminMutation implements MutationInterface
{
    use MutationTrait;
    use OpinionAdminInputTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly OpinionRepository $opinionRepository,
        private readonly UserRepository $userRepository,
        private readonly ValidatorInterface $validator
    ) {}

    /**
     * @return array{opinion: null|Opinion, errorCode: null|string}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        // Like the Sonata edit action, any administrator can edit any opinion (Opinion::canDisplay()).
        $opinion = $this->opinionRepository->find(GlobalIdResolver::getDecodedId((string) $input->offsetGet('id'), true));
        if (!$opinion instanceof Opinion) {
            return ['opinion' => null, 'errorCode' => OpinionAdminErrorCode::NOT_FOUND];
        }

        $errorCode = $this->applyInput($opinion, $input, $this->userRepository, $this->validator);
        if (null !== $errorCode) {
            return ['opinion' => null, 'errorCode' => $errorCode];
        }

        $this->em->flush();

        return ['opinion' => $opinion, 'errorCode' => null];
    }
}
