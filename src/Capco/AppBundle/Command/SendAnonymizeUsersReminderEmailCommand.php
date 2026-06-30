<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Message\MailSingleRecipientMessage;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Twig\SiteImageRuntime;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
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
        private readonly ParticipantRepository $participantRepository,
        private readonly Environment $twig,
        private readonly RouterInterface $router,
        private readonly LocaleResolver $localeResolver,
        private readonly SiteParameterResolver $siteParams,
        private readonly TranslatorInterface $translator,
        private readonly Manager $manager,
        private readonly LoggerInterface $logger,
        private readonly MessageBusInterface $bus,
        private readonly SiteImageRuntime $siteImageRuntime,
        private readonly EntityManagerInterface $entityManager,
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
        $templateBase = $this->getTemplateBase();

        $count = 0;
        $delayInMs = 0;
        $nextDelayThreshold = $apiLimitPerHour;

        while (true) {
            $inactiveUsers = $this->userRepository->findInactiveUsersEmailAndAnonToken(
                inactivityLimitDate: $inactivityLimitDate,
                limit: $batchSize
            );

            $inactiveParticipants = $this->participantRepository->findInactiveParticipantsEmailAndAnonToken(
                inactivityLimitDate: $inactivityLimitDate,
                limit: $batchSize
            );

            if (empty($inactiveUsers) && empty($inactiveParticipants)) {
                $io->info('Emails sent successfully to all inactive users and participants.');

                return Command::SUCCESS;
            }

            foreach ($inactiveUsers as $user) {
                $message = new MailSingleRecipientMessage(
                    senderEmail: $senderEmail,
                    recipientEmail: $user['email'],
                    subject: $subject,
                    htmlContent: $this->getTemplateContent($user['anonymizationReminderEmailToken'], $templateBase),
                );

                $this->bus->dispatch($message, [
                    new DelayStamp($delayInMs),
                ]);
            }

            foreach ($inactiveParticipants as $participant) {
                $message = new MailSingleRecipientMessage(
                    senderEmail: $senderEmail,
                    recipientEmail: $participant['email'],
                    subject: $subject,
                    htmlContent: $this->getTemplateContent($participant['anonymizationReminderEmailToken'], $templateBase),
                );

                $this->bus->dispatch($message, [
                    new DelayStamp($delayInMs),
                ]);
            }

            if (!empty($inactiveUsers)) {
                $userIds = array_map(fn ($user) => $user['id'], $inactiveUsers);
                $this->updateAnonymizationReminderEmailSentAt($userIds);
            }

            if (!empty($inactiveParticipants)) {
                $participantIds = array_map(fn ($participant) => $participant['id'], $inactiveParticipants);
                $this->updateParticipantAnonymizationReminderEmailSentAt($participantIds);
            }

            $count += \count($inactiveUsers) + \count($inactiveParticipants);

            while ($count >= $nextDelayThreshold) {
                $delayInMs += $delayIncrementInMs;
                $nextDelayThreshold += $apiLimitPerHour;
            }

            $this->entityManager->clear();
        }
    }

    /**
     * @param string[] $userIds
     */
    private function updateAnonymizationReminderEmailSentAt(array $userIds): void
    {
        $this->userRepository->updateAnonymizationReminderEmailSentAt($userIds);
    }

    /**
     * @param string[] $participantIds
     */
    private function updateParticipantAnonymizationReminderEmailSentAt(array $participantIds): void
    {
        $this->participantRepository->updateAnonymizationReminderEmailSentAt($participantIds);
    }

    /**
     * @param array{
     *     siteName: string|null,
     *     logo: string|null,
     *     baseUrl: string,
     *     user_locale: string|null,
     *     day: int
     * } $templateBase
     */
    private function getTemplateContent(string $token, array $templateBase): string
    {
        $preserveDataUrl = $this->router->generate('preserve_account_data', [
            'token' => $token,
        ], RouterInterface::ABSOLUTE_URL);

        return $this->twig->render('@CapcoMail/anonymizationReminderEmail.html.twig', array_merge($templateBase, [
            'preserveDataUrl' => $preserveDataUrl,
        ]));
    }

    /**
     * @return array{
     *     siteName: string|null,
     *     logo: string|null,
     *     baseUrl: string,
     *     user_locale: string|null,
     *     day: int
     * }
     */
    private function getTemplateBase(): array
    {
        $baseUrl = $this->router->generate(
            'app_homepage',
            ['_locale' => $this->localeResolver->getDefaultLocaleCodeForRequest()],
            RouterInterface::ABSOLUTE_URL
        );

        return [
            'siteName' => $this->siteParams->getValue('global.site.fullname'),
            'logo' => $this->siteImageRuntime->getAppLogoUrl(),
            'baseUrl' => $baseUrl,
            'user_locale' => $this->translator->getLocale(),
            'day' => $this->anonymizationInactivityEmailReminderDays,
        ];
    }
}
