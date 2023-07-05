<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mailing;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Enum\EmailingCampaignStatus;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Security\EmailingCampaignVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class SendEmailingCampaignMutation extends AbstractEmailingCampaignMutation
{
    private Publisher $publisher;

    public function __construct(
        GlobalIdResolver $resolver,
        EntityManagerInterface $entityManager,
        AuthorizationCheckerInterface $authorizationChecker,
        Publisher $publisher
    ) {
        parent::__construct($resolver, $entityManager, $authorizationChecker);
        $this->publisher = $publisher;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $error = null;

        try {
            $emailingCampaign = $this->getSendableCampaign($input, $viewer);
            $emailingCampaign->getSendAt()
                ? $this->planEmailingCampaign($emailingCampaign)
                : $this->sendEmailingCampaign($emailingCampaign);
            $this->entityManager->flush();
        } catch (UserError $exception) {
            $emailingCampaign = null;
            $error = $exception->getMessage();
        }

        return compact('emailingCampaign', 'error');
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

        return $this->authorizationChecker->isGranted(EmailingCampaignVoter::SEND, $emailCampaign);
    }

    private function planEmailingCampaign(EmailingCampaign $emailingCampaign): EmailingCampaign
    {
        $emailingCampaign->setStatus(EmailingCampaignStatus::PLANNED);

        return $emailingCampaign;
    }

    private function sendEmailingCampaign(EmailingCampaign $emailingCampaign): void
    {
        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::EMAILING_CAMPAIGN,
            new Message(
                json_encode([
                    'emailingCampaignId' => $emailingCampaign->getId(),
                ])
            )
        );

        $emailingCampaign->setSendAt(new \DateTime());
        $emailingCampaign->setStatus(EmailingCampaignStatus::SENT);
    }
}
