<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\UserBundle\Entity\User;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Helper\ConvertCsvToArray;

class UnsubscribeUserFromCsvCommand extends Command
{
    protected static $defaultName = 'capco:user:unsubscribe';

    private UserRepository $userRepository;
    private EntityManagerInterface $em;
    private ConvertCsvToArray $convertCsvToArray;
    private Publisher $publisher;

    public function __construct(
        ?string $name,
        UserRepository $userRepository,
        EntityManagerInterface $em,
        ConvertCsvToArray $convertCsvToArray,
        Publisher $publisher
    ) {
        parent::__construct($name);
        $this->userRepository = $userRepository;
        $this->em = $em;
        $this->convertCsvToArray = $convertCsvToArray;
        $this->publisher = $publisher;
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
                    $this->pushToSendinblue(['email' => $user->getEmail()]);
                    $user->setConsentInternalCommunication(false);
                }

            } else {
                $output->writeln('<info>User not found with email: '.$row['EMAIL'].'</info>');
            }
        }

        $this->em->flush();
    }

    private function pushToSendinblue(array $args = []): void
    {
        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::SENDINBLUE,
            new Message(
                json_encode([
                    'method' => 'blackListUser',
                    'args' => $args,
                ])
            )
        );
    }
}
