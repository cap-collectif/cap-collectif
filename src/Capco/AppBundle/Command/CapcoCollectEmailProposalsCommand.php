<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\CollectStepImapServerConfig;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Imap\Exception\FolderNotFoundException;
use Capco\AppBundle\Imap\ImapClient;
use Capco\AppBundle\Manager\MediaManager;
use Capco\AppBundle\Repository\CollectStepRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Util\TokenGenerator;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Filesystem\Filesystem;
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
        private readonly MediaManager $mediaManager,
        private readonly CollectStepRepository $collectStepRepository,
        private readonly TranslatorInterface $translator,
        private readonly TokenGenerator $tokenGenerator,
        private readonly Filesystem $filesystem,
        private readonly Manager $manager,
        private readonly string $projectRootDir,
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

    private function saveAndZipMedias(AttachmentCollection $attachments): ArrayCollection
    {
        $zip = new \ZipArchive();
        $zipFilename = "{$this->tokenGenerator->generateToken()}.zip";
        if (!$zip->open($zipFilename, \ZipArchive::CREATE)) {
            throw new \Exception('Failed opening zip archive');
        }

        $medias = new ArrayCollection();
        $mediasPublicPath = $this->projectRootDir . '/public/media/default/0001/01';

        foreach ($attachments as $attachment) {
            $filename = $attachment->filename;
            $attachment->save($mediasPublicPath, $filename);
            $zip->addFile("{$mediasPublicPath}/{$filename}", basename("{$mediasPublicPath}/{$filename}"));
        }

        $zip->close();
        $this->filesystem->rename($zipFilename, "{$mediasPublicPath}/{$zipFilename}");

        $media = $this->mediaManager->createImageFromPath("{$mediasPublicPath}/{$zipFilename}", $zipFilename);
        $this->em->persist($media);

        $medias->add($media);

        return $medias;
    }

    private function saveMedias(AttachmentCollection $attachments): ArrayCollection
    {
        $medias = new ArrayCollection();
        $mediasPublicPath = $this->projectRootDir . '/public/media/default/0001/01';

        foreach ($attachments as $attachment) {
            $filename = $attachment->filename;
            $attachment->save($mediasPublicPath, $filename);
            $media = $this->mediaManager->createImageFromPath("{$mediasPublicPath}/{$filename}", $filename);
            $this->em->persist($media);
            $medias->add($media);
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
