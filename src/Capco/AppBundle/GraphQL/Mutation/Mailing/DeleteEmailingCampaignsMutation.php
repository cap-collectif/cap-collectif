<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mailing;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Enum\DeleteEmailingCampaignsErrorCode;
use Capco\UserBundle\Entity\User;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;

class DeleteEmailingCampaignsMutation extends AbstractEmailingCampaignMutation
{
    public function __invoke(Argument $input, User $viewer): array
    {
        $error = null;
        $deletedIds = [];
        $archivedIds = [];

        try {
            $campaigns = $this->getEmailingCampaigns($input, $viewer);

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
            if (
                1 ===
                $campaign
                    ->getMailingList()
                    ->getEmailingCampaigns()
                    ->count()
            ) {
                $campaign->getMailingList()->setIsDeletable(true);
            }
        }
    }

    private function getEmailingCampaigns(Argument $input, User $viewer): array
    {
        $emailingCampaigns = [];
        foreach ($input->offsetGet('ids') as $globalId) {
            $emailingCampaign = $this->findCampaignFromGlobalId($globalId, $viewer);
            if (null === $emailingCampaign) {
                throw new UserError(DeleteEmailingCampaignsErrorCode::ID_NOT_FOUND);
            }

            $emailingCampaigns[$globalId] = $emailingCampaign;
        }

        if (empty($emailingCampaigns)) {
            throw new UserError(DeleteEmailingCampaignsErrorCode::EMPTY);
        }

        return $emailingCampaigns;
    }
}
