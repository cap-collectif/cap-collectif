<?php

namespace Capco\AppBundle\Command\RedirectionIo;

use Capco\AppBundle\Entity\HttpRedirect;
use Capco\AppBundle\Enum\HttpRedirectDuration;
use Capco\AppBundle\Enum\HttpRedirectType;
use Capco\AppBundle\HttpRedirect\HttpRedirectCacheInvalidator;
use Capco\AppBundle\HttpRedirect\HttpRedirectUrlNormalizer;
use Capco\AppBundle\Repository\HttpRedirectRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\HttpFoundation\Response;

class UrlsMigrationCommand extends Command
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly HttpRedirectRepository $httpRedirectRepository,
        private readonly HttpRedirectCacheInvalidator $httpRedirectCacheInvalidator,
        private readonly HttpRedirectUrlNormalizer $httpRedirectUrlNormalizer
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->setName('capco:redirection-io:urls-migration')
            ->setDescription('Import Redirection.io rules from a JSON export into http_redirect.')
            ->addArgument('filePath', InputArgument::REQUIRED, 'Path to the Redirection.io JSON export file.')
            ->addOption('apply', null, InputOption::VALUE_NONE, 'Write the imported redirects to database.')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $filePath = (string) $input->getArgument('filePath');
        $isDryRun = !(bool) $input->getOption('apply');

        if (!is_file($filePath) || !is_readable($filePath)) {
            $io->error(sprintf('File "%s" does not exist or is not readable.', $filePath));

            return Command::FAILURE;
        }

        try {
            $payload = json_decode((string) file_get_contents($filePath), true, 512, \JSON_THROW_ON_ERROR);
        } catch (\JsonException $exception) {
            $io->error(sprintf('Invalid JSON file: %s', $exception->getMessage()));

            return Command::FAILURE;
        }

        if (!\is_array($payload) || !isset($payload['rules']) || !\is_array($payload['rules'])) {
            $io->error('The JSON export does not contain a valid "rules" array.');

            return Command::FAILURE;
        }

        $created = 0;
        $updated = 0;
        $skipped = 0;
        $errors = [];
        $warnings = [];
        $operations = [];
        $processedRedirects = [];
        $rules = $payload['rules'];
        $rulesCount = \count($rules);

        $io->section($isDryRun ? 'Analyzing Redirection.io export' : 'Preparing Redirection.io import');
        $progressBar = $io->createProgressBar($rulesCount);
        $progressBar->start();

        foreach ($rules as $index => $rule) {
            if (!\is_array($rule)) {
                ++$skipped;
                $errors[] = sprintf('Rule #%d skipped: invalid rule payload.', $index);
                $progressBar->advance();

                continue;
            }

            if (($rule['enabled'] ?? true) !== true) {
                ++$skipped;
                $progressBar->advance();

                continue;
            }

            $rawSourceUrl = $rule['trigger']['source'] ?? null;
            $action = $this->findSupportedAction($rule['actions'] ?? []);

            if (!\is_string($rawSourceUrl) || null === $action) {
                ++$skipped;
                $errors[] = sprintf('Rule #%d skipped: missing source or supported action.', $index);
                $progressBar->advance();

                continue;
            }

            $sourceUrl = $this->normalizeSourceUrl($rawSourceUrl);
            $destinationUrl = $this->normalizeDestinationUrl((string) $action['location']);

            if (null === $sourceUrl || null === $destinationUrl) {
                ++$skipped;
                $errors[] = sprintf('Rule #%d skipped: invalid source or destination URL.', $index);
                $progressBar->advance();

                continue;
            }

            $statusCode = (int) $action['statusCode'];
            if (Response::HTTP_TEMPORARY_REDIRECT === $statusCode || Response::HTTP_PERMANENTLY_REDIRECT === $statusCode) {
                $warnings[] = sprintf(
                    'Rule #%d uses HTTP %d and will be imported as HTTP %d because only 301 and 302 are currently supported.',
                    $index,
                    $statusCode,
                    $this->getSupportedStatusCode($statusCode)
                );
            }

            $duration = $this->mapDuration($statusCode);
            $redirect = $processedRedirects[$sourceUrl] ?? $this->httpRedirectRepository->findOneBy(['sourceUrl' => $sourceUrl]);

            if (!$redirect instanceof HttpRedirect) {
                $redirect = (new HttpRedirect())
                    ->setSourceUrl($sourceUrl)
                    ->setDestinationUrl($destinationUrl)
                    ->setDuration($duration)
                    ->setRedirectType(HttpRedirectType::REDIRECTION)
                ;
                $processedRedirects[$sourceUrl] = $redirect;
                $operations[] = ['type' => 'create', 'redirect' => $redirect];
                ++$created;
                $progressBar->advance();

                continue;
            }

            $redirect
                ->setDestinationUrl($destinationUrl)
                ->setDuration($duration)
                ->setRedirectType(HttpRedirectType::REDIRECTION)
            ;
            $processedRedirects[$sourceUrl] = $redirect;
            $operations[] = ['type' => 'update', 'redirect' => $redirect];

            ++$updated;
            $progressBar->advance();
        }

        $progressBar->finish();
        $io->newLine(2);

        $io->table(
            ['Created', 'Updated', 'Skipped', 'Dry run'],
            [[(string) $created, (string) $updated, (string) $skipped, $isDryRun ? 'yes' : 'no']]
        );

        foreach ($errors as $error) {
            $io->warning($error);
        }
        foreach ($warnings as $warning) {
            $io->warning($warning);
        }

        if (!$isDryRun && ($created > 0 || $updated > 0)) {
            if (!$io->confirm('Do you want to apply the migration?', false)) {
                $io->warning('Migration cancelled. No change has been applied.');

                return Command::SUCCESS;
            }

            $io->section('Applying migration');
            $applyProgressBar = $io->createProgressBar(\count($operations));
            $applyProgressBar->start();

            foreach ($operations as $index => $operation) {
                if ('create' === $operation['type']) {
                    $this->entityManager->persist($operation['redirect']);
                }

                if (0 === (($index + 1) % 100)) {
                    $this->entityManager->flush();
                }

                $applyProgressBar->advance();
            }

            $this->entityManager->flush();
            $applyProgressBar->finish();
            $io->newLine(2);
            $this->httpRedirectCacheInvalidator->invalidateAll();
            $io->success('Migration applied and redirect cache invalidated.');
        }

        return Command::SUCCESS;
    }

    /**
     * @return null|array{location: string, statusCode: int, type: string}
     */
    private function findSupportedAction(mixed $actions): ?array
    {
        if (!\is_array($actions)) {
            return null;
        }

        foreach ($actions as $action) {
            if (
                \is_array($action)
                && ($action['type'] ?? null) === 'redirection'
                && \is_string($action['location'] ?? null)
                && \is_int($action['statusCode'] ?? null)
            ) {
                return $action;
            }
        }

        return null;
    }

    private function normalizeSourceUrl(string $sourceUrl): ?string
    {
        $normalizedSourceUrl = $this->httpRedirectUrlNormalizer->normalizeSourceUrl($sourceUrl);

        return '' === $normalizedSourceUrl ? null : $normalizedSourceUrl;
    }

    private function normalizeDestinationUrl(string $destinationUrl): ?string
    {
        $destinationUrl = trim($destinationUrl);
        if ('' === $destinationUrl) {
            return null;
        }

        if (str_starts_with($destinationUrl, '//')) {
            $destinationUrl = 'https:' . $destinationUrl;
        } elseif (!preg_match('#^https?://#i', $destinationUrl) && !str_starts_with($destinationUrl, '/')) {
            $destinationUrl = 'https://' . $destinationUrl;
        }

        $parts = parse_url($destinationUrl);
        if (false === $parts) {
            return null;
        }

        if (isset($parts['host']) || str_starts_with($destinationUrl, '/')) {
            return $destinationUrl;
        }

        return null;
    }

    private function mapDuration(int $statusCode): string
    {
        return Response::HTTP_MOVED_PERMANENTLY === $statusCode || Response::HTTP_PERMANENTLY_REDIRECT === $statusCode
            ? HttpRedirectDuration::PERMANENT
            : HttpRedirectDuration::TEMPORARY;
    }

    private function getSupportedStatusCode(int $statusCode): int
    {
        return Response::HTTP_PERMANENTLY_REDIRECT === $statusCode
            ? Response::HTTP_MOVED_PERMANENTLY
            : Response::HTTP_FOUND;
    }
}
