<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\CollectStepImapServerConfig;
use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Imap\Exception\FolderNotFoundException;
use Capco\AppBundle\Imap\ImapClient;
use Capco\AppBundle\Provider\MediaProvider;
use Capco\AppBundle\Repository\CollectStepRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Util\TokenGenerator;
use Gaufrette\Filesystem as GaufretteFilesystem;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Contracts\Translation\TranslatorInterface;
use Webklex\PHPIMAP\Message;
use Webklex\PHPIMAP\Support\AttachmentCollection;

#[AsCommand(
    name: 'capco:collect-email-proposals',
    description: 'Read email inboxes to create proposals',
)]
class CapcoCollectEmailProposalsCommand extends Command
{
    public const ZIP_FILES_THRESHOLD = 5;
    public const MAX_MEDIA_SIZE_BYTES = 8000000; // 8Mo

    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $em,
        private readonly Indexer $indexer,
        private readonly MediaProvider $mediaProvider,
        private readonly CollectStepRepository $collectStepRepository,
        private readonly TranslatorInterface $translator,
        private readonly TokenGenerator $tokenGenerator,
        private readonly Manager $manager,
        private readonly GaufretteFilesystem $gaufretteFilesystem,
        private readonly LoggerInterface $logger,
        private ?SymfonyStyle $io = null,
        ?string $name = null
    ) {
        parent::__construct($name);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->io = new SymfonyStyle($input, $output);

        if (!$this->manager->isActive(Manager::collect_proposals_by_email)) {
            $this->io->warning('Feature toggle ' . Manager::collect_proposals_by_email . ' not enabled');

            return Command::INVALID;
        }

        $steps = $this->collectStepRepository->findByEnabledImapConfig();

        $this->io->info('Fetching inboxes from ' . \count($steps) . ' steps');

        foreach ($steps as $step) {
            $config = $step->getCollectStepImapServerConfig();

            try {
                $this->createProposalFromMailBox($config);
            } catch (\Exception $e) {
                $this->io->error($e->getMessage());

                continue;
            }
        }

        $this->io->info('Command ran successfully');

        return Command::SUCCESS;
    }

    private function createProposalFromMailBox(CollectStepImapServerConfig $config): void
    {
        $serverUrl = $config->getServerUrl();
        $login = $config->getEmail();
        $password = $config->getPassword();
        $folderPath = $config->getFolder();

        $imapClient = new ImapClient($serverUrl, $login, $password);
        $client = $imapClient->getClient();
        $client->connect();

        $folder = $client->getFolderByPath($folderPath);

        if (!$folder) {
            throw new FolderNotFoundException('Folder not found: ' . $folderPath);
        }

        $step = $config->getCollectStep();
        $proposalForm = $step->getProposalForm();

        $messages = $folder->messages()->unseen()->get();

        $messagesCount = \count($messages);

        $this->io->info("Parsing {$messagesCount} messages");

        $stepIsTimeless = $step->isTimeless();
        $stepEndAt = $step->getEndAt();
        $stepStartAt = $step->getStartAt();

        /** @var Message $message */
        foreach ($messages as $message) {
            try {
                $sentAt = new \DateTime($message->getDate()->get()->__toString());
                $isSentAfterStepIsClosed = !$stepIsTimeless && $sentAt > $stepEndAt;
                if ($isSentAfterStepIsClosed) {
                    $this->io->error('Step is closed');
                    $message->setFlag('Seen');

                    continue;
                }

                $isSentBeforeStepIsOpened = !$stepIsTimeless && $sentAt < $stepStartAt;

                if ($isSentBeforeStepIsOpened) {
                    $this->io->error('Step is not opened yet.');
                    $message->setFlag('Seen');

                    continue;
                }

                $body = $this->parseBody($message->getHTMLBody());

                if (!$body) {
                    $this->io->error('Cannot create proposal because body is empty');
                    $message->setFlag('Seen');

                    continue;
                }

                $attachments = $message->getAttachments()->filter(fn ($attachment) => \strlen((string) $attachment->getContent()) <= self::MAX_MEDIA_SIZE_BYTES);
                $hasMediaQuestion = \count($proposalForm->getRealQuestions()->filter(fn ($question) => $question instanceof MediaQuestion)) > 0;

                $medias = new ArrayCollection();
                if ($hasMediaQuestion && $attachments->isNotEmpty()) {
                    if (\count($attachments) >= self::ZIP_FILES_THRESHOLD) {
                        $medias = $this->saveAndZipMedias($attachments);
                    } else {
                        $medias = $this->saveMedias($attachments);
                    }
                }

                $title = $this->decodeString($message->getSubject()->get());
                $senderEmail = $message->getFrom()->get()->toArray()['mail'];
                $user = $this->getUser($senderEmail);

                $this->createProposal($user, $title, $body, $proposalForm, $medias);

                $this->em->flush();
                $this->indexer->finishBulk();

                $message->setFlag('Seen');
            } catch (\Exception $e) {
                $message->unsetFlag('Seen');

                $this->em->clear();

                $this->logger->error('Failed to process email proposal, marking as unread for retry', [
                    'subject' => $message->getSubject()->get(),
                    'from' => $message->getFrom()->get()->toArray()['mail'] ?? 'unknown',
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);

                $this->io->error("Failed to process email: {$e->getMessage()}. Email marked as unread for retry.");

                continue;
            }
        }
    }

    private function parseBody(string $body): string
    {
        $body = $this->decodeString($body);

        return preg_replace('/<meta[^>]*>/', '', $body);
    }

    // in remote server it is encoded in ASCII, so we need to convert it
    private function decodeString(string $string): string
    {
        $encoding = mb_detect_encoding($string);
        if ('UTF-8' !== $encoding) {
            return iconv_mime_decode($string, 0, 'UTF-8') ?: '';
        }

        return $string;
    }

    private function sanitizeFilename(string $filename): string
    {
        $filename = $this->decodeString($filename);

        $filename = basename($filename);

        $filename = preg_replace('/[^a-zA-Z0-9._-]/', '_', $filename);

        $filename = preg_replace('/_+/', '_', (string) $filename);

        $filename = trim((string) $filename, '_');

        if (\strlen($filename) > 200) {
            $ext = pathinfo($filename, \PATHINFO_EXTENSION);
            $name = pathinfo($filename, \PATHINFO_FILENAME);
            $maxNameLength = 195 - \strlen($ext);
            $filename = substr($name, 0, $maxNameLength) . '.' . $ext;
        }

        if (empty($filename) || '.' === $filename) {
            $filename = 'attachment_' . uniqid();
        }

        return $filename;
    }

    private function saveAndZipMedias(AttachmentCollection $attachments): ArrayCollection
    {
        $medias = new ArrayCollection();
        $tempZipFilename = "{$this->tokenGenerator->generateToken()}.zip";
        $tempZipPath = sys_get_temp_dir() . '/' . $tempZipFilename;

        $zip = new \ZipArchive();
        if (!$zip->open($tempZipPath, \ZipArchive::CREATE)) {
            throw new \Exception('Failed opening zip archive');
        }

        foreach ($attachments as $attachment) {
            $originalFilename = $attachment->filename;
            $sanitizedFilename = $this->sanitizeFilename($originalFilename);
            $content = $attachment->getContent();

            if (!empty($content)) {
                $zip->addFromString($sanitizedFilename, $content);
            }
        }

        $zip->close();

        try {
            $file = new File($tempZipPath);
            $media = new Media();
            $media->setProviderName(MediaProvider::class);
            $media->setBinaryContent($file);
            $media->setName($tempZipFilename);
            $media->setContentType($file->getMimeType() ?: 'application/zip');
            $media->setSize($file->getSize());
            $media->setContext('default');
            $media->setEnabled(true);

            $providerReference = $this->mediaProvider->generateName($media);
            $media->setProviderReference($providerReference);

            $zipContent = file_get_contents($tempZipPath);
            $gaufrettePath = "default/0001/01/{$providerReference}";
            $bytesWritten = $this->gaufretteFilesystem->write($gaufrettePath, $zipContent, true);

            $this->em->persist($media);
            $medias->add($media);

            $this->logger->info('Zip archive saved', [
                'provider_reference' => $providerReference,
                'bytes' => $bytesWritten,
                'attachments' => \count($attachments),
            ]);

            $this->io->info('Created zip archive with ' . \count($attachments) . " attachments: {$providerReference} ({$bytesWritten} bytes)");
        } catch (\Exception $e) {
            $this->logger->error('Failed to save zip archive', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        } finally {
            if (file_exists($tempZipPath)) {
                unlink($tempZipPath);
            }
        }

        return $medias;
    }

    private function saveMedias(AttachmentCollection $attachments): ArrayCollection
    {
        $medias = new ArrayCollection();

        foreach ($attachments as $attachment) {
            $tempPath = null;

            try {
                $originalFilename = $attachment->filename;
                $sanitizedFilename = $this->sanitizeFilename($originalFilename);
                $content = $attachment->getContent();

                if (empty($content)) {
                    $this->logger->warning('Attachment content is empty', [
                        'filename' => $originalFilename,
                    ]);

                    continue;
                }

                $extension = pathinfo($sanitizedFilename, \PATHINFO_EXTENSION) ?: 'bin';
                $tempPath = sys_get_temp_dir() . '/' . uniqid('email_attachment_') . '.' . $extension;
                file_put_contents($tempPath, $content);

                $file = new File($tempPath);
                $media = new Media();
                $media->setProviderName(MediaProvider::class);
                $media->setBinaryContent($file);
                $media->setName($sanitizedFilename);
                $media->setContentType($file->getMimeType());
                $media->setSize($file->getSize());
                $media->setContext('default');
                $media->setEnabled(true);

                $providerReference = $this->mediaProvider->generateName($media);
                $media->setProviderReference($providerReference);

                $gaufrettePath = "default/0001/01/{$providerReference}";
                $bytesWritten = $this->gaufretteFilesystem->write($gaufrettePath, $content, true);

                $this->em->persist($media);
                $medias->add($media);

                $this->logger->info('Attachment saved', [
                    'original' => $originalFilename,
                    'provider_reference' => $providerReference,
                    'bytes' => $bytesWritten,
                ]);

                $this->io->info("Saved attachment: {$originalFilename} as {$providerReference} ({$bytesWritten} bytes)");
            } catch (\Exception $e) {
                $this->logger->error('Failed to save email attachment', [
                    'filename' => $attachment->filename ?? 'unknown',
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                $this->io->warning("Failed to save attachment: {$attachment->filename} - {$e->getMessage()}");
            } finally {
                if ($tempPath && file_exists($tempPath)) {
                    unlink($tempPath);
                }
            }
        }

        return $medias;
    }

    private function getUser(string $email): User
    {
        $user = $this->userRepository->findOneBy(['email' => $email]);

        if ($user) {
            return $user;
        }

        $user = (new User())
            ->setEmail($email)
            ->setConfirmationToken(null)
            ->setEnabled(true)
            ->setUsername($this->translator->trans('contribution-by-email'))
        ;

        $this->em->persist($user);

        $this->io->info('User created with email ' . $email);

        return $user;
    }

    private function createProposal(User $user, ?string $title, string $body, ProposalForm $proposalForm, ArrayCollection $medias): void
    {
        $proposal = (new Proposal())
            ->setAuthor($user)
            ->setTitle($title)
            ->setBody($body)
            ->setProposalForm($proposalForm)
            ->setDraft(true)
            ->setConsentInternalCommunicationToken($this->tokenGenerator->generateToken())
        ;

        // handle attachments
        $questions = $proposalForm->getRealQuestions();
        /** * @var AbstractQuestion $question */
        foreach ($questions as $question) {
            if ($question instanceof MediaQuestion && !$medias->isEmpty()) {
                $mediaResponse = (new MediaResponse())
                    ->setProposal($proposal)
                    ->setQuestion($question)
                    ->setMedias($medias)
                ;

                $this->em->persist($mediaResponse);

                break;
            }
        }

        $this->em->persist($proposal);

        if (!$title) {
            $proposal->setTitle($this->translator->trans('proposal-email-ref-number', ['ref' => $proposal->getFullReference()]));
        }

        $this->indexer->buildDocumentAndAddToBulk($proposal);
        $this->indexer->buildDocumentAndAddToBulk($proposal->getAuthor());

        $this->io->info('Proposal created with title ' . $title);
    }
}
