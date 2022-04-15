<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\NewsletterSubscription;
use Capco\AppBundle\Repository\NewsletterSubscriptionRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class SendInBlueController extends AbstractController
{
    private NewsletterSubscriptionRepository $newsletterSubscriptionRepository;
    private UserRepository $userRepository;
    private EntityManagerInterface $entityManager;
    private string $sendInBlueSecret;

    public function __construct(
        NewsletterSubscriptionRepository $newsletterSubscriptionRepository,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager,
        string $sendInBlueSecret
    ) {
        $this->newsletterSubscriptionRepository = $newsletterSubscriptionRepository;
        $this->userRepository = $userRepository;
        $this->entityManager = $entityManager;
        $this->sendInBlueSecret = $sendInBlueSecret;
    }

    /**
     * configure web hook in https://my.sendinblue.com/advanced/webhook
     * @Route("/sendinblue/unsubscribe/{token}", name="sendinblue_unsubscribe", options={"i18n" = false})
     */
    public function unsubscribeUserFromSendInBlueToApp(Request $request, string $token): void
    {
        if ($token !== $this->sendInBlueSecret) {
            return;
        }

        if ($content = $request->getContent()) {
            $parametersAsArray = json_decode($content, true) ?? [];
            $email = $parametersAsArray['email'] ?? null;
            $event = $parametersAsArray['event'] ?? null;
            if ('unsubscribe' !== $event || !$email) {
                return;
            }

            /** @var NewsletterSubscription $email */
            $subscription = $this->newsletterSubscriptionRepository->findOneByEmail($email);
            $user = $this->userRepository->findOneByEmail($email);
            $subscription->setIsEnabled(false);
            $this->entityManager->persist($subscription);
            if ($user instanceof User) {
                $user->setConsentInternalCommunication(false);
                $user->getNotificationsConfiguration()->setConsentInternalCommunication(false);
                $this->entityManager->persist($user);
            }

            $this->entityManager->flush();
        }
    }
}
