<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\NewsletterSubscription;
use Capco\AppBundle\Repository\NewsletterSubscriptionRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class SendInBlueController extends AbstractController
{
    public function __construct(
        private readonly NewsletterSubscriptionRepository $newsletterSubscriptionRepository,
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly string $sendInBlueSecret,
        private readonly LoggerInterface $logger
    ) {
    }

    /**
     * configure web hook in https://my.sendinblue.com/advanced/webhook.
     *
     * @Route("/sendinblue/unsubscribe/{token}", name="sendinblue_unsubscribe", options={"i18n" = false}, methods={"POST"})
     */
    public function unsubscribeUserFromSendInBlueToApp(
        Request $request,
        string $token
    ): JsonResponse {
        if ($token !== $this->sendInBlueSecret) {
            $this->logger->error(sprintf('%s : wrong secret', __METHOD__));

            return $this->json(['ACCESS_DENIED'], 403);
        }
        $parametersAsArray = json_decode($request->getContent(), true);

        if (!empty($parametersAsArray)) {
            $email = $parametersAsArray['email'] ?? null;
            $event = $parametersAsArray['event'] ?? null;
            if ('unsubscribe' !== $event || !$email) {
                $this->logger->error(sprintf('%s : bad event  %s ; ', __METHOD__, $event));

                return $this->json(
                    [
                        'NOK' => 'BAD_EVENT',
                    ],
                    500
                );
            }

            /** @var NewsletterSubscription $email */
            $subscription = $this->newsletterSubscriptionRepository->findOneByEmail($email);
            if ($subscription) {
                $subscription->setIsEnabled(false);
                $this->entityManager->persist($subscription);
            }
            $user = $this->userRepository->findOneByEmail($email);
            if (!$user instanceof User) {
                $this->logger->error(
                    sprintf('%s  : user with email %s not found', __METHOD__, $email)
                );
            }
            $user->setConsentInternalCommunication(false);
            $this->entityManager->persist($user);

            try {
                $this->entityManager->flush();
            } catch (\RuntimeException) {
                $this->logger->error('fail on save');

                return $this->json(['KO' => true], 500);
            }

            return $this->json(['OK' => true], 201);
        }

        return $this->json([], 500);
    }
}
