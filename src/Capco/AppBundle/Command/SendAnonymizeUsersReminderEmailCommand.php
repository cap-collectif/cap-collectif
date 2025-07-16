<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Message\MailSingleRecipientMessage;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Twig\SiteImageRuntime;
use Capco\UserBundle\Repository\UserRepository;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Messenger\Stamp\DelayStamp;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;
use Twig\Environment;

#[AsCommand(name: 'capco:send_anonymize_users_reminder_email_command', description: 'Send anonymize reminder email to users that has been inactive since X days')]
class SendAnonymizeUsersReminderEmailCommand extends Command
{
    private const DEFAULT_BATCH_SIZE = 1000;
    private const DEFAULT_API_LIMIT_PER_HOUR = 10_000;
    private const DELAY_INCREMENT = 3_600_000; // 1 hour in ms

    public function __construct(
        private readonly int $anonymizationInactivityDays,
        private readonly int $anonymizationInactivityEmailReminderDays,
        private readonly UserRepository $userRepository,
        private readonly Environment $twig,
        private readonly RouterInterface $router,
        private readonly LocaleResolver $localeResolver,
        private readonly SiteParameterResolver $siteParams,
        private readonly TranslatorInterface $translator,
        private readonly Manager $manager,
        private readonly LoggerInterface $logger,
        private readonly MessageBusInterface $bus,
        private readonly SiteImageRuntime $siteImageRuntime,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption(
            'batchSize',
            null,
            InputOption::VALUE_REQUIRED,
            'The limit of users to fetch by batch.',
            self::DEFAULT_BATCH_SIZE
        );
        $this->addOption(
            'apiLimitPerHour',
            null,
            InputOption::VALUE_REQUIRED,
            'At what threshold we should add delay to the sending.',
            self::DEFAULT_API_LIMIT_PER_HOUR
        );
        $this->addOption(
            'delayIncrementInMs',
            null,
            InputOption::VALUE_REQUIRED,
            'How much we should increment the delay between calls in ms.',
            self::DELAY_INCREMENT
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        if (!$this->manager->isActive(Manager::user_anonymization_automated)) {
            $this->logger->warning(Manager::user_anonymization_automated . ' feature must be enabled');
            $io->warning(Manager::user_anonymization_automated . ' feature must be enabled');

            return 0;
        }

        $batchSize = (int) $input->getOption('batchSize');
        $apiLimitPerHour = (int) $input->getOption('apiLimitPerHour');
        $delayIncrementInMs = (int) $input->getOption('delayIncrementInMs');

        $inactivityLimitDate = (new \DateTimeImmutable())->modify('-' . $this->anonymizationInactivityDays . ' days');

        $senderEmail = $this->siteParams->getValue('admin.mail.notifications.send_address');
        $subject = $this->translator->trans('user-anonymization-email-subject');

        $count = 0;
        $delayInMs = 0;

        while (true) {
            $inactiveUsers = $this->userRepository->findInactiveUsersEmailAndAnonToken(
                inactivityLimitDate: $inactivityLimitDate,
                limit: $batchSize
            );

            if (empty($inactiveUsers)) {
                $io->info('Emails sent successfully to all inactive users.');

                return Command::SUCCESS;
            }

            foreach ($inactiveUsers as $user) {
                $message = new MailSingleRecipientMessage(
                    senderEmail: $senderEmail,
                    recipientEmail: $user->getEmail(),
                    subject: $subject,
                    htmlContent: $this->getTemplateContent($user->getAnonymizationReminderEmailToken()),
                );

                $this->bus->dispatch($message, [
                    new DelayStamp($delayInMs),
                ]);
            }

            $emails = array_map(fn ($user) => $user->getEmail(), $inactiveUsers);
            $this->updateAnonymizationReminderEmailSentAt($emails);

            $count += $batchSize;

            if (0 === $count % $apiLimitPerHour) {
                $delayInMs += $delayIncrementInMs;
            }
        }
    }

    /**
     * @param string[] $emails
     */
    private function updateAnonymizationReminderEmailSentAt(array $emails): void
    {
        $this->userRepository->updateAnonymizationReminderEmailSentAt($emails);
    }

    private function getTemplateContent(string $token): string
    {
        $baseUrl = $this->router->generate(
            'app_homepage',
            ['_locale' => $this->localeResolver->getDefaultLocaleCodeForRequest()],
            RouterInterface::ABSOLUTE_URL
        );

        $preserveDataUrl = $this->router->generate('preserve_account_data', [
            'token' => $token,
        ], RouterInterface::ABSOLUTE_URL);

        $logo = $this->siteImageRuntime->getAppLogoUrl();

        $siteName = $this->siteParams->getValue('global.site.fullname');

        return $this->twig->render('@CapcoMail/anonymizationReminderEmail.html.twig', [
            'siteName' => $siteName,
            'logo' => $logo,
            'baseUrl' => $baseUrl,
            'preserveDataUrl' => $preserveDataUrl,
            'user_locale' => $this->translator->getLocale(),
            'day' => $this->anonymizationInactivityEmailReminderDays,
        ]);
    }
}
