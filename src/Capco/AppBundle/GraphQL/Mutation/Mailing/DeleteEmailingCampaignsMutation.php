<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mailing;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Enum\DeleteEmailingCampaignsErrorCode;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Security\EmailingCampaignVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class DeleteEmailingCampaignsMutation extends AbstractEmailingCampaignMutation
{
    private GlobalIdResolver $globalIdResolver;

    public function __construct(
        GlobalIdResolver $resolver,
        EntityManagerInterface $entityManager,
        AuthorizationCheckerInterface $authorizationChecker,
        GlobalIdResolver $globalIdResolver
    ) {
        parent::__construct($resolver, $entityManager, $authorizationChecker);
        $this->globalIdResolver = $globalIdResolver;
    }

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

    public function isGranted(array $emailCampaignIds, ?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }

        foreach ($emailCampaignIds as $emailCampaignId) {
            $emailCampaign = $this->globalIdResolver->resolve($emailCampaignId, $viewer);
            $canDelete = $this->authorizationChecker->isGranted(
                EmailingCampaignVoter::DELETE,
                $emailCampaign
            );
            if (!$canDelete) {
                return false;
            }
        }

        return true;
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
            if (
                $emailingCampaign
                && $this->authorizationChecker->isGranted(
                    EmailingCampaignVoter::DELETE,
                    $emailingCampaign
                )
            ) {
                $emailingCampaigns[$globalId] = $emailingCampaign;
            } else {
                throw new UserError(DeleteEmailingCampaignsErrorCode::ID_NOT_FOUND);
            }
        }

        if (empty($emailingCampaigns)) {
            throw new UserError(DeleteEmailingCampaignsErrorCode::EMPTY);
        }

        return $emailingCampaigns;
    }
}
