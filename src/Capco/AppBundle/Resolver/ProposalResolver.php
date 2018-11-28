<?php

namespace Capco\AppBundle\Resolver;

use Box\Spout\Common\Exception\SpoutException;
use Box\Spout\Common\Type;
use Box\Spout\Writer\WriterFactory;
use Box\Spout\Writer\WriterInterface;
use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\Resolver\User\UserUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

class ProposalResolver
{
    const FOLLOWER_HEADER = [
        'id',
        'email',
        'username',
        'firstname',
        'lastname',
        'followedAt',
        'userType_name',
        'url',
    ];
    const FOLLOWER_FILE_EXPORT_NAME = 'followers_%proposal%_%date%';

    protected $em;
    protected $rootDir;
    protected $userUrlResolver;
    protected $logger;

    public function __construct(
        EntityManagerInterface $entityManager,
        string $rootDir,
        UserUrlResolver $userUrlResolver,
        LoggerInterface $logger
    ) {
        $this->em = $entityManager;
        $this->rootDir = $rootDir;
        $this->userUrlResolver = $userUrlResolver;
        $this->logger = $logger;
    }

    public function exportProposalFollowers(Proposal $proposal, string $fileType = Type::CSV): array
    {
        $proposalFollowers = $proposal->getFollowers();
        $followers = [];
        /** @var Follower $follower */
        foreach ($proposalFollowers as $key => $follower) {
            $userFollower = $follower->getUser();
            $followers[$key]['id'] = $userFollower->getId();
            $followers[$key]['email'] = $userFollower->getEmail();
            $followers[$key]['username'] = $userFollower->getUsername();
            $followers[$key]['firstname'] = $userFollower->getFirstname();
            $followers[$key]['lastname'] = $userFollower->getLastname();
            $followers[$key]['followedAt'] = $follower->getFollowedAt()->format('d-m-Y H:i:s');
            $followers[$key]['userType_name'] =
                null !== $userFollower->getUserType()
                    ? $userFollower->getUserType()->getName()
                    : 'NONE';
            $followers[$key]['url'] = $this->userUrlResolver->__invoke($userFollower);
        }
        $path = $this->rootDir . '/../web/export/';
        $proposalSlug = $proposal->getSlug();
        $date = new \DateTime();
        $date = $date->format('d-m-Y-His');
        $filename = str_replace('%proposal%', $proposalSlug, self::FOLLOWER_FILE_EXPORT_NAME);
        $filename = str_replace('%date%', $date, $filename);
        $filename = $filename . '.' . $fileType;
        $absolutePath = $path . $filename;
        $writer = '';
        try {
            /** @var WriterInterface $writer */
            $writer = WriterFactory::create($fileType);
            $writer->openToFile($absolutePath);
            $writer->addRow(self::FOLLOWER_HEADER);
            $writer->addRows($followers);
        } catch (SpoutException $spoutException) {
            $this->logger->addError(__METHOD__ . $spoutException->getMessage());
        }
        if ($writer instanceof WriterInterface) {
            $writer->close();
        }
        $content = file_get_contents($absolutePath);
        $this->deleteFile($absolutePath);

        return ['content' => $content, 'filename' => $filename];
    }

    public function deleteFile(string $filename): bool
    {
        if (file_exists($filename)) {
            return unlink($filename);
        }

        return false;
    }
}
