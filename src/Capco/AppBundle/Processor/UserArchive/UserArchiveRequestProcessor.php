<?php

namespace Capco\AppBundle\Processor\UserArchive;

use Capco\AppBundle\Entity\UserArchive;
use Capco\AppBundle\Notifier\UserArchiveNotifier;
use Capco\AppBundle\Repository\UserArchiveRepository;
use Doctrine\ORM\EntityManagerInterface;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\BufferedOutput;
use Symfony\Component\HttpKernel\KernelInterface;

class UserArchiveRequestProcessor implements ProcessorInterface
{
    protected $userArchiveRepository;
    protected $userArchiveNotifier;
    protected $rootDir;
    protected $em;
    protected $kernel;

    public function __construct(
        UserArchiveRepository $userArchiveRepository,
        EntityManagerInterface $em,
        UserArchiveNotifier $userArchiveNotifier,
        KernelInterface $kernel,
        $rootDir
    ) {
        $this->userArchiveRepository = $userArchiveRepository;
        $this->userArchiveNotifier = $userArchiveNotifier;
        $this->rootDir = $rootDir;
        $this->em = $em;
        $this->kernel = $kernel;
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

        $app = new Application($this->kernel);
        $command = $app->find('capco:export:user');

        if ($this->kernel->getEnvironment() === 'test'){
            $input = new ArrayInput([
                'userId' => $user->getId(),
                '--delimiter' => ','
            ]);
        } else {
            $input = new ArrayInput([
                'userId' => $user->getId(),
            ]);
        }

        $output = new BufferedOutput();

        if (0 === $command->run($input, $output)) {
            $this->userArchiveNotifier->onUserArchiveGenerated($archive);

            return true;
        }

        return false;
    }
}
