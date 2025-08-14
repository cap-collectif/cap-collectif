<?php

namespace Capco\AppBundle\Service\ParticipationWorkflow;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Exception\RecentlySentException;
use Capco\AppBundle\FileSystem\ConfigFileSystem;
use Capco\AppBundle\Service\EmailRateLimiter;
use Capco\UserBundle\Authenticator\Dto\MagicLinkPayload;
use Capco\UserBundle\Authenticator\MagicLinkAuthenticator;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Firebase\JWT\JWT;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class MagicLinkEmailSender
{
    public const DEFAULT = 'DEFAULT';
    public const ACCOUNT_DETECTED = 'ACCOUNT_DETECTED';

    public const EMAIL_RECENTLY_SENT = 'EMAIL_RECENTLY_SENT';

    public function __construct(private readonly EntityManagerInterface $em, private readonly ConfigFileSystem $filesystem, private readonly RouterInterface $router, private readonly UserRepository $userRepository, private readonly Publisher $publisher, private readonly EmailRateLimiter $emailRateLimiter, private readonly KernelInterface $kernel, private readonly ParticipationCookieManager $participationCookieManager)
    {
    }

    /**
     * @return array{'errorCode': string|null, 'confirmationUrl': string|null}
     */
    public function send(string $email, string $redirectUrl, ?string $variant = self::DEFAULT): array
    {
        $user = $this->userRepository->findOneBy(['email' => $email]);

        try {
            $this->rateLimit($email);
        } catch (RecentlySentException) {
            return ['errorCode' => self::EMAIL_RECENTLY_SENT, 'confirmationUrl' => null];
        }

        if (!$user) {
            // we don't return any errors deliberately, in order to avoid the security breach that would allow someone to find out whether the email exists in the database
            return ['errorCode' => null, 'confirmationUrl' => null];
        }

        $username = $user->getUsername();
        $magicLinkUrl = $this->generateMagicLinkUrl($email, $username, $redirectUrl);

        $this->sendEmail($magicLinkUrl, $email, $variant);
        $user->setMagicLinkSentAt(new \DateTime('now'));
        $this->em->flush();

        $confirmationUrl = null;
        if ('test' === $this->kernel->getEnvironment()) {
            $confirmationUrl = $magicLinkUrl;
        }

        return ['errorCode' => null, 'confirmationUrl' => $confirmationUrl];
    }

    private function rateLimit(string $email): void
    {
        $encodedEmail = base64_encode($email);
        $cacheKey = "magic_link.email.{$encodedEmail}";
        $this->emailRateLimiter->rateLimit($cacheKey);
    }

    private function generateMagicLinkUrl(string $email, string $username, ?string $customRedirectUrl): string
    {
        $participationCookies = $this->participationCookieManager->all();

        $privateKey = $this->filesystem->get('jwt/private.pem')->getContent();

        if ($customRedirectUrl) {
            $redirectUrl = $customRedirectUrl;
        } else {
            $redirectUrl = $this->router->generate('app_homepage', [], UrlGeneratorInterface::ABSOLUTE_URL);
        }

        $payload = (new MagicLinkPayload($email, $username, $redirectUrl))->toArray();
        $token = JWT::encode($payload, $privateKey, MagicLinkAuthenticator::JWT_ENCRYPTION_ALGORITHM);

        return $this->router
            ->generate('capco_magic_link', ['token' => $token, 'redirectUrl' => $redirectUrl, 'participationCookies' => $participationCookies], UrlGeneratorInterface::ABSOLUTE_URL)
        ;
    }

    private function sendEmail(string $magicLinkUrl, string $email, string $variant = self::DEFAULT): void
    {
        $body = json_encode([
            'magicLinkUrl' => $magicLinkUrl,
            'email' => $email,
            'variant' => $variant,
        ]);

        if (!$body) {
            return;
        }

        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::MAGIC_LINK_EMAIL,
            new Message(
                $body
            )
        );
    }
}
