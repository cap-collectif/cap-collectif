<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\SmsCredit;
use Capco\AppBundle\Entity\SmsOrder;
use Capco\AppBundle\GraphQL\Resolver\Argument\ArgumentUrlResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Sms\AlertSmsConsumedCreditMessage;
use Capco\AppBundle\Mailer\Message\Sms\CreateSmsOrderMessage;
use Capco\AppBundle\Mailer\Message\Sms\InitialSmsCreditMessage;
use Capco\AppBundle\Mailer\Message\Sms\RefillSmsCreditMessage;
use Capco\AppBundle\Mailer\Message\Sms\RefillSmsOrderMessage;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Repository\UserRepository;
use Symfony\Component\Routing\RequestContext;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class SmsNotifier extends BaseNotifier
{
    private const BUSINESS_TEAM_EMAIL = 'developpement@cap-collectif.com';
    protected ArgumentUrlResolver $argumentUrlResolver;
    protected TranslatorInterface $translator;
    private RequestContext $context;
    private UserRepository $userRepository;

    public function __construct(
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        ArgumentUrlResolver $argumentUrlResolver,
        RouterInterface $router,
        LocaleResolver $localeResolver,
        RequestContext $context,
        UserRepository $userRepository
    ) {
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
        $this->argumentUrlResolver = $argumentUrlResolver;
        $this->context = $context;
        $this->userRepository = $userRepository;
    }

    public function onCreateSmsOrder(SmsOrder $smsOrder): void
    {
        $platformLink = "{$this->context->getScheme()}://{$this->context->getHost()}";

        $this->mailer->createAndSendMessage(
            CreateSmsOrderMessage::class,
            $smsOrder,
            [
                'platformLink' => $platformLink,
                'platformName' => $this->siteParams->getValue('global.site.fullname'),
            ],
            null,
            self::BUSINESS_TEAM_EMAIL
        );
    }

    public function onInitialSmsCredit(SmsCredit $smsCredit): void
    {
        $users = $this->userRepository->findByRoleAdminOrSuperAdmin();

        $platformLink = "{$this->context->getScheme()}://{$this->context->getHost()}";
        $projectsUrl = "{$platformLink}/admin-next/projects";

        foreach ($users as $user) {
            $this->mailer->createAndSendMessage(
                InitialSmsCreditMessage::class,
                $smsCredit,
                [
                    'platformLink' => $platformLink,
                    'platformName' => $this->siteParams->getValue('global.site.fullname'),
                    'projectsUrl' => $projectsUrl,
                ],
                null,
                $user->getEmail()
            );
        }
    }

    public function onRefillSmsOrder(SmsOrder $smsOrder): void
    {
        $platformLink = "{$this->context->getScheme()}://{$this->context->getHost()}";

        $this->mailer->createAndSendMessage(
            RefillSmsOrderMessage::class,
            $smsOrder,
            [
                'platformLink' => $platformLink,
                'platformName' => $this->siteParams->getValue('global.site.fullname'),
            ],
            null,
            self::BUSINESS_TEAM_EMAIL
        );
    }

    public function onRefillSmsCredit(SmsCredit $smsCredit): void
    {
        $users = $this->userRepository->findByRoleAdminOrSuperAdmin();

        $platformLink = "{$this->context->getScheme()}://{$this->context->getHost()}";
        $adminUrl = "{$platformLink}/admin-next/secure-participation";

        foreach ($users as $user) {
            $this->mailer->createAndSendMessage(
                RefillSmsCreditMessage::class,
                $smsCredit,
                [
                    'platformLink' => $platformLink,
                    'platformName' => $this->siteParams->getValue('global.site.fullname'),
                    'adminUrl' => $adminUrl,
                ],
                null,
                $user->getEmail()
            );
        }
    }

    public function onAlertSmsConsumedCredit(int $remainingCredits, int $remainingCreditsPercent): void
    {
        $users = $this->userRepository->findByRoleAdminOrSuperAdmin();

        $platformLink = "{$this->context->getScheme()}://{$this->context->getHost()}";
        $adminUrl = "{$platformLink}/admin-next/secure-participation";

        $emails = array_map(function ($user) {
            return $user->getEmail();
        }, $users);
        $emails[] = self::BUSINESS_TEAM_EMAIL;
        foreach ($emails as $email) {
            $this->mailer->createAndSendMessage(
                AlertSmsConsumedCreditMessage::class,
                null,
                [
                    'platformName' => $this->siteParams->getValue('global.site.fullname'),
                    'remainingCredits' => $remainingCredits,
                    'remainingCreditsPercent' => $remainingCreditsPercent,
                    'adminUrl' => $adminUrl,
                ],
                null,
                $email
            );
        }
    }
}
