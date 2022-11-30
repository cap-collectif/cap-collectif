<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mailing;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Enum\EmailingCampaignStatus;
use Capco\AppBundle\Security\EmailingCampaignVoter;
use Capco\UserBundle\Entity\User;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;

class CancelEmailingCampaignMutation extends AbstractEmailingCampaignMutation
{
    public function __invoke(Argument $input, User $viewer)
    {
        $emailingCampaign = null;
        $error = null;

        try {
            $emailingCampaign = $this->getPlannedCampaign($input, $viewer);
            self::cancelCampaign($emailingCampaign);
            $this->entityManager->flush();
        } catch (UserError $exception) {
            $emailingCampaign = null;
            $error = $exception->getMessage();
        }

        return compact('emailingCampaign', 'error');
    }

    private static function cancelCampaign(EmailingCampaign $emailingCampaign): EmailingCampaign
    {
        $emailingCampaign->setStatus(EmailingCampaignStatus::DRAFT);

        return $emailingCampaign;
    }

    public function isGranted(string $id, ?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }

        $emailCampaign = $this->findCampaignFromGlobalId($id, $viewer);
        if (!$emailCampaign) {
            return false;
        }

        return $this->authorizationChecker->isGranted(EmailingCampaignVoter::CANCEL, $emailCampaign);
    }
}
