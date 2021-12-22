<?php

namespace Capco\AppBundle\Command;

use InvalidArgumentException;
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

    public function __construct(
        string $name = null,
        UserRepository $userRepository,
        EntityManagerInterface $em,
        ConvertCsvToArray $convertCsvToArray
    ) {
        parent::__construct($name);
        $this->userRepository = $userRepository;
        $this->em = $em;
        $this->convertCsvToArray = $convertCsvToArray;
    }

    protected function configure()
    {
        $this->setDescription('Unsubscribe user list from CSV')
            ->addArgument(
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

            if (!\is_object($user)) {
                $output->writeln(
                    '<info>User not found with email: ' . $row['EMAIL'] . '</info>'
                );
            } else {
                $user->setConsentInternalCommunication(false);
                $user->setConsentExternalCommunication(false);
            }

        }

        $this->em->flush();
    }
}
