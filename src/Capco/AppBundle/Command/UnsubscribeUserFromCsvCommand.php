<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Helper\ConvertCsvToArray;
use Capco\AppBundle\Mailer\SendInBlue\SendInBluePublisher;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class UnsubscribeUserFromCsvCommand extends Command
{
    protected static $defaultName = 'capco:user:unsubscribe';

    private readonly UserRepository $userRepository;
    private readonly EntityManagerInterface $em;
    private readonly ConvertCsvToArray $convertCsvToArray;
    private readonly SendInBluePublisher $sendInBluePublisher;

    public function __construct(
        ?string $name,
        UserRepository $userRepository,
        EntityManagerInterface $em,
        ConvertCsvToArray $convertCsvToArray,
        SendInBluePublisher $sendInBluePublisher
    ) {
        parent::__construct($name);
        $this->userRepository = $userRepository;
        $this->em = $em;
        $this->convertCsvToArray = $convertCsvToArray;
        $this->sendInBluePublisher = $sendInBluePublisher;
    }

    protected function configure()
    {
        $this->setDescription('Unsubscribe user list from CSV')->addArgument(
            'filePath',
            InputArgument::REQUIRED,
            'Please provide the path of the file you want to use.'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->import($input, $output);

        return 0;
    }

    protected function import(InputInterface $input, OutputInterface $output)
    {
        $filePath = $input->getArgument('filePath');
        $data = $this->convertCsvToArray->convert($filePath);

        foreach ($data as $key => $row) {
            $user = $this->userRepository->findOneBy(['email' => $row['EMAIL']]);
            if ($user instanceof User) {
                $user->setConsentExternalCommunication(false);
                if ($user->isConsentInternalCommunication()) {
                    $this->sendInBluePublisher->pushToSendinblue('blackListUser', ['email' => $user->getEmail()]);
                    $user->setConsentInternalCommunication(false);
                }
            } else {
                $output->writeln('<info>User not found with email: ' . $row['EMAIL'] . '</info>');
            }
        }

        $this->em->flush();
    }
}
