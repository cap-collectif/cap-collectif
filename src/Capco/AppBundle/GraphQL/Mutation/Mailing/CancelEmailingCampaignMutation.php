<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mailing;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Enum\EmailingCampaignStatus;
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
}
