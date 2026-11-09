<?php

namespace Capco\AppBundle\GraphQL\Mutation\OpinionAdmin;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Enum\OpinionAdminErrorCode;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\OpinionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class DeleteOpinionAdminMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly OpinionRepository $opinionRepository
    ) {}

    /**
     * @return array{deletedOpinionId: null|string, errorCode: null|string}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $id = (string) $input->offsetGet('id');
        // Like the Sonata delete action, any administrator can delete any opinion (Opinion::canDisplay()).
        $opinion = $this->opinionRepository->find(GlobalIdResolver::getDecodedId($id, true));
        if (!$opinion instanceof Opinion) {
            return ['deletedOpinionId' => null, 'errorCode' => OpinionAdminErrorCode::NOT_FOUND];
        }

        // Arguments, sources, appendices, versions and reportings are removed with it (cascade "remove").
        $this->em->remove($opinion);
        $this->em->flush();

        return ['deletedOpinionId' => $id, 'errorCode' => null];
    }
}
