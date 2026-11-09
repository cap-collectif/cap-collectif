<?php

namespace Capco\AppBundle\GraphQL\Mutation\OpinionAdmin;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Enum\OpinionAdminErrorCode;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\OpinionTypeRepository;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateOpinionAdminMutation implements MutationInterface
{
    use MutationTrait;
    use OpinionAdminInputTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly OpinionTypeRepository $opinionTypeRepository,
        private readonly UserRepository $userRepository,
        private readonly ValidatorInterface $validator
    ) {}

    /**
     * @return array{opinion: null|Opinion, errorCode: null|string}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $opinionType = $this->opinionTypeRepository->find((string) $input->offsetGet('opinionTypeId'));
        if (!$opinionType instanceof OpinionType || !$opinionType->getConsultation()) {
            return ['opinion' => null, 'errorCode' => OpinionAdminErrorCode::OPINION_TYPE_NOT_FOUND];
        }

        // Like OpinionAdmin::getNewInstance(): the opinion is created in the consultation of its opinion type.
        // It is not published, as with Sonata.
        $opinion = (new Opinion())->setOpinionType($opinionType)->setConsultation($opinionType->getConsultation());

        $errorCode = $this->applyInput($opinion, $input, $this->userRepository, $this->validator);
        if (null !== $errorCode) {
            return ['opinion' => null, 'errorCode' => $errorCode];
        }

        $this->em->persist($opinion);
        $this->em->flush();

        return ['opinion' => $opinion, 'errorCode' => null];
    }
}
