<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mailing;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Enum\DeleteEmailingCampaignsErrorCode;
use Capco\AppBundle\Repository\EmailingCampaignRepository;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class DeleteEmailingCampaignsMutation implements MutationInterface
{
    private EmailingCampaignRepository $repository;
    private EntityManagerInterface $entityManager;

    public function __construct(
        EmailingCampaignRepository $repository,
        EntityManagerInterface $entityManager
    ) {
        $this->repository = $repository;
        $this->entityManager = $entityManager;
    }

    public function __invoke(Argument $input): array
    {
        $error = null;
        $deletedIds = [];
        $archivedIds = [];

        try {
            $campaigns = $this->getEmailingCampaigns($input);

            foreach ($campaigns as $globalId => $campaign) {
                if ($campaign->isEditable()) {
                    $this->freeMailingList($campaign);
                    $this->entityManager->remove($campaign);
                    $deletedIds[] = $globalId;
                } else {
                    $campaign->archive();
                    $archivedIds[] = $globalId;
                }
            }
            $this->entityManager->flush();
        } catch (UserError $exception) {
            $error = $exception->getMessage();
        }

        return compact('error', 'deletedIds', 'archivedIds');
    }

    private function freeMailingList(EmailingCampaign $campaign): void
    {
        if ($campaign->getMailingList()) {
            if (1 === $campaign->getMailingList()->getEmailingCampaigns()->count()) {
                $campaign->getMailingList()->setIsDeletable(true);
            }
        }
    }

    private function getEmailingCampaigns(Argument $input): array
    {
        $emailingCampaigns = [];
        foreach ($input->offsetGet('ids') as $globalId) {
            $id = GlobalId::fromGlobalId($globalId)['id'];
            if (null === $id) {
                throw new UserError(
                    DeleteEmailingCampaignsErrorCode::ID_NOT_FOUND
                );
            }

            $campaign = $this->repository->find($id);
            if (null === $campaign) {
                throw new UserError(
                    DeleteEmailingCampaignsErrorCode::ID_NOT_FOUND
                );
            }

            $emailingCampaigns[$globalId] = $campaign;
        }

        if (empty($emailingCampaigns)) {
            throw new UserError(
                DeleteEmailingCampaignsErrorCode::EMPTY
            );
        }

        return $emailingCampaigns;
    }
}
