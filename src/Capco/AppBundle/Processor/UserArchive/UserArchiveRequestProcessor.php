<?php

namespace Capco\AppBundle\Processor\UserArchive;

use Box\Spout\Common\Type;
use Box\Spout\Writer\WriterFactory;
use Capco\AppBundle\Entity\UserArchive;
use Capco\AppBundle\GraphQL\InfoResolver;
use Capco\AppBundle\Notifier\UserArchiveNotifier;
use Capco\AppBundle\Repository\UserArchiveRepository;
use Capco\AppBundle\Utils\Arr;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Request\Executor;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

error_reporting(E_ALL);

class UserArchiveRequestProcessor implements ProcessorInterface
{
    protected $userArchiveRepository;
    protected $userArchiveNotifier;
    protected $rootDir;
    protected $executor;
    protected $em;

    public function __construct(UserArchiveRepository $userArchiveRepository, EntityManagerInterface $em, UserArchiveNotifier $userArchiveNotifier, Executor $executor, string $rootDir)
    {
        $this->userArchiveRepository = $userArchiveRepository;
        $this->userArchiveNotifier = $userArchiveNotifier;
        $this->rootDir = $rootDir;
        $this->executor = $executor;
        $this->em = $em;
    }

    public function process(Message $message, array $options): ?bool
    {
        $json = json_decode($message->getBody(), true);
        $id = $json['userArchiveId'];

        /** @var UserArchive $archive */
        $archive = $this->userArchiveRepository->find($id);
        if (!$archive) {
            throw new \RuntimeException('Unable to find archive with id : ' . $id);
        }

        $user = $archive->getUser();
        $userDataPath = $this->createUserDataFile($user);

        $this->createZipArchive($this->getZipPathForUser($user), [
            ['data.csv' => $userDataPath],
        ]);

        $archive->setIsGenerated(true);
        $archive->setPath($this->getZipFilenameForUser($user));

        $this->em->flush();

        $this->userArchiveNotifier->onUserArchiveGenerated($archive);

        return true;
    }

    protected function createZipArchive(string $zipName, array $files, bool $removeFilesAfter = true): void
    {
        $zip = new \ZipArchive();
        $zip->open($zipName, \ZipArchive::CREATE);
        foreach ($files as $file) {
            foreach ($file as $localName => $path) {
                $zip->addFile($path, $localName);
            }
        }

        $zip->close();

        if ($removeFilesAfter) {
            foreach ($files as $file) {
                foreach ($file as $localName => $path) {
                    unlink($path);
                }
            }
        }
    }

    protected function createUserDataFile(User $user): string
    {
        $infoResolver = new InfoResolver();
        $writer = WriterFactory::create(Type::CSV);
        $path = $this->getUserDataPathForUser($user);
        $writer->openToFile($path);

        $data = $this->executor->disabledDebugInfo()->execute([
            'query' => $this->getUserGraphQLQuery($user->getId()),
            'variables' => [],
        ])->toArray();

        $header = array_map(function ($item) {
            $item = str_replace('data_node_', '', $item);
            if ('show_url' !== $item) {
                $item = str_replace('_', '.', $item);
            }

            return $item;
        }, $infoResolver->guessHeadersFromFields($data));

        $writer->addRow($header);

        $row = [];
        foreach ($header as $value) {
            $row[] = Arr::path($data, "data.node.$value") ?? '';
        }
        $writer->addRow($row);

        $writer->close();

        return $path;
    }

    protected function getUserDataPathForUser(User $user): string
    {
        return $this->rootDir . '/../web/export/' . $user->getId() . '_data.csv';
    }

    protected function getZipFilenameForUser(User $user): string
    {
        return $user->getId() . '.zip';
    }

    protected function getZipPathForUser(User $user): string
    {
        return $this->rootDir . '/../web/export/' . $this->getZipFilenameForUser($user);
    }

    protected function getUserGraphQLQuery(string $userId): string
    {
        return <<<EOF
{
  node(id: "${userId}") {
    ... on User {
      id
      email
      username
      userType {
        name
      }
      createdAt
      updatedAt
      expired
      lastLogin
      rolesText
      consentExternalCommunication
      enabled
      locked
      phoneConfirmed
      phoneConfirmationSentAt
      gender
      firstname
      lastname
      dateOfBirth
      website
      biography
      address
      address2
      zipCode
      city
      phone
      show_url
      googleId
      facebookId
      samlId
      opinionsCount
      opinionVotesCount
      opinionVersionsCount
      argumentsCount
      argumentVotesCount
      proposalsCount
      proposalVotesCount
      commentVotesCount
      sourcesCount
      repliesCount
      postCommentsCount
      eventCommentsCount
      projectsCount
    }
  }
}
EOF;
    }
}
